import React, { PropTypes } from 'react';
import { connect } from 'react-redux';

import {
  Grid,
  Row,
  Col,
  Button,
  ButtonGroup,
  Glyphicon,
  Well,
  Panel
} from 'react-bootstrap';

import * as  actions from '../actions';

const ListItem = props => {
  const { channel, createHref, unsubscribe } = props;
  return (
    <Panel>
    <div className="media">
      <div className="media-left">
        <a href="#">
          <img className="media-object"
               height={60}
               width={60}
               src={channel.image}
               alt={channel.title} />
        </a>
      </div>
      <div className="media-body">
        <Grid>
          <Row>
            <Col xs={6} md={9}>
              <h4 className="media-heading"><a href={createHref("/podcasts/channel/" + channel.id + "/")}>{channel.title}</a></h4>
            </Col>
            <Col xs={6} md={3}>
              <ButtonGroup>
                <Button title="Unsubscribe" onClick={unsubscribe}><Glyphicon glyph="trash" /> Unsubscribe</Button>
              </ButtonGroup>
            </Col>
          </Row>
        </Grid>
      </div>
    </div>
    {channel.description ? <Well style={{ marginTop: 20 }}>{channel.description}</Well> : ''}
  </Panel>

  );
};


export class Subscriptions extends React.Component {
  componentDidMount() {
    this.props.dispatch(actions.channels.getChannels());
  }
  render() {
    const { createHref } = this.props.history;
    const { channels } = this.props;

    if (!channels || channels.length === 0) {
      return (
        <span>You haven't subscribed to any channels yet.
          Discover new channels and podcasts <a href={createHref("/podcasts/search/")}>here</a>.</span>);
    }

    return (
      <div>
      {this.props.channels.map(channel => {
        const unsubscribe = () => {
            this.props.dispatch(actions.subscribe.unsubscribe(channel.id, channel.title));
        };
        return <ListItem key={channel.id}
                         channel={channel}
                         unsubscribe={unsubscribe}
                         createHref={createHref} />;
      })}
      </div>
    );
  }
}

Subscriptions.propTypes = {
    channels: PropTypes.array.isRequired
};

const mapStateToProps = state => {
  return {
    channels: state.channels || []
  };
};

export default connect(mapStateToProps)(Subscriptions);