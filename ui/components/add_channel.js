import React, { PropTypes } from 'react';
import { reduxForm } from 'redux-form';
import validator from 'validator';

import {
  Modal,
  Button,
  ButtonGroup,
  ProgressBar,
} from 'react-bootstrap';

import * as api from '../api';
import Icon from './icon';
import { FormGroup } from './form';
import { unauthorized } from '../actions/auth';

const validate = values => {
  return values.url && validator.isURL(values.url) ? {} : {
    url: 'You must provide a valid URL',
  };
};

export class AddChannelModal extends React.Component {

  constructor(props) {
    super(props);
    this.state = this.getDefaultState();
  }

  componentWillReceiveProps(newProps) {
    if (newProps.submitting && !this.props.submitting) {
      this.setState({
        interval: window.setInterval(() => {
          this.setState({ progress: this.state.progress + 1 });
        }, 100),
      });
    } else if (!newProps.submitting && this.props.submitting) {
      window.clearInterval(this.state.interval);
      this.setState(this.getDefaultState());
    }
    return this.props !== newProps;
  }

  getDefaultState() {
    return {
      progress: 0,
      interval: null,
    };
  }

  handleAddChannel(values) {
    return new Promise((resolve, reject) => {
      api.addChannel(values.url)
      .then(result => {
        this.props.onComplete(result.data);
        this.props.resetForm();
        resolve();
      }, error => {
        reject(error.data.url ? error.data : { url: error.data });
        // handle if session timed out
        // would be nice to have more elegant way
        if (error.status === 401) {
          this.props.resetForm();
          this.props.onClose();
          this.props.dispatch(unauthorized());
        }
      });
    });
  }

  render() {
    const { show, onClose, container } = this.props;

    const {
      handleSubmit,
      fields: { url },
      submitting,
      resetForm,
    } = this.props;

    const handleClose = event => {
      resetForm();
      onClose(event);
    };

    return (
      <Modal show={show}
        aria-labelledby="add-channel-modal-title"
        container={container}
        onHide={handleClose}
      >
        <Modal.Header closeButton>
          <Modal.Title id="add-channel-modal-title">Add a new RSS feed</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            {submitting ? (
            <div>
              <ProgressBar now={this.state.progress} />
            </div>
            ) : (
            <form className="form" onSubmit={handleSubmit(this.handleAddChannel.bind(this))}>
               <FormGroup field={url}>
                <input type="text" className="form-control" {...url} />
              </FormGroup>
            <p>Enter the URL of the RSS feed you want to subscribe to, for example:
              <br /><em>http://joeroganexp.joerogan.libsynpro.com/rss</em>
            </p>
              <ButtonGroup>
              <Button bsStyle="primary" type="submit"><Icon icon="plus" /> Add feed</Button>
              <Button bsStyle="default" onClick={handleClose}><Icon icon="remove" /> Cancel</Button>
            </ButtonGroup>
            </form>
            )}
        </Modal.Body>
      </Modal>
    );
  }

}


AddChannelModal.propTypes = {
  fields: PropTypes.object.isRequired,
  dispatch: PropTypes.func.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  resetForm: PropTypes.func.isRequired,
  onComplete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  show: PropTypes.bool.isRequired,
  container: PropTypes.object.isRequired,
};

export default reduxForm({
  form: 'add-channel',
  fields: ['url'],
  validate,
})(AddChannelModal);
