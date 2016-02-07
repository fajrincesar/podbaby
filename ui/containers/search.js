import _ from 'lodash';
import React, { PropTypes } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Grid, Row, Col } from 'react-bootstrap';
import { routeActions } from 'redux-simple-router';
import DocumentTitle from 'react-document-title';

import * as actions from '../actions';
import { bindAllActionCreators } from '../actions/utils';
import { podcastsSelector, channelsSelector } from '../selectors';
import ChannelItem from '../components/channel_item';
import PodcastList from '../components/podcasts';
import Icon from '../components/icon';
import { getTitle } from './utils';

export class Search extends React.Component {

  constructor(props) {
    super(props);
    this.actions = bindAllActionCreators(actions, this.props.dispatch);
    this.route = bindActionCreators(routeActions, this.props.dispatch);
    this.handleSearch = this.handleSearch.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
  }

  handleSearch(event) {
    event.preventDefault();
    const value = _.trim(this.refs.query.value);
    const type = this.refs.channels.checked ? 'channels' : 'podcasts';
    const hasChanged = (
      value !== this.props.searchQuery ||
      type !== this.props.searchType
    );
    if (value && hasChanged) {
      this.route.replace(`/search/?q=${value}&t=${type}`);
      this.actions.search.search(value, type);
    } else if (!value) {
      this.actions.search.clearSearch();
    }
  }

  handleSelect() {
    this.refs.query.select();
  }

  renderSearchResults() {
    const {
      dispatch,
      channels,
      podcasts,
      isLoading,
      searchQuery } = this.props;

    if (isLoading) {
      return '';
    }

    if (channels.length === 0 &&
        podcasts.length === 0 &&
        searchQuery) return <div>Sorry, no results found for your search.</div>;

    const channelItems = channels.length > 0 && channels.map(channel => {
      const subscribe = event => {
        event.preventDefault();
        dispatch(actions.subscribe.toggleSubscribe(channel));
      };

      return (
        <ChannelItem
          key={channel.id}
          channel={channel}
          subscribe={subscribe}
          {...this.props}
        />
      );
    });

    const podcastItems = podcasts.length > 0 ?

      <PodcastList
        actions={actions}
        showChannel
        ifEmpty=""
        {...this.props}
      /> : '';

    if (podcastItems) {
      return <div>{podcastItems}</div>;
    }
    return channelItems;
  }

  render() {
    const { searchQuery, searchType } = this.props;

    const help = (
      searchQuery ? '' :
        <span>
          <b>Hint:</b>
          Try a general category e.g. <em>history</em> or <em>movies</em>,
          the title of a podcast, or the name of a feed e. g. <em>RadioLab</em>.
        </span>
      );

    return (
      <DocumentTitle title={getTitle('Search podcasts and feeds')}>
        <div>
          <form className="form" onSubmit={this.handleSearch}>
            <div className="form-group">
              <input
                className="form-control"
                type="search"
                ref="query"
                defaultValue={searchQuery}
                onClick={this.handleSelect}
                placeholder="Find a feed or podcast"
              />
              {help ? <div className="help-block">{help}</div> : ''}
            </div>
            <Grid>
              <Row>
                <Col md={6} xs={6}>
                  <label>
                    <input
                      checked={searchType === 'podcasts'}
                      onChange={this.handleSearch}
                      name="type"
                      label="Search podcasts"
                      type="radio"
                      ref="podcasts"
                      value="podcasts"
                    /> Search podcasts
                  </label>
                </Col>
                <Col md={6} xs={6}>
                  <label>
                    <input
                      checked={searchType === 'channels'}
                      onChange={this.handleSearch}
                      name="type"
                      type="radio"
                      ref="channels"
                      value="channels"
                    /> Search feeds
                  </label>
                </Col>
              </Row>
            </Grid>
            <Button type="submit" bsStyle="primary" className="form-control">
                <Icon icon="search" /> Search
            </Button>
          </form>
          {this.renderSearchResults()}
        </div>
      </DocumentTitle>
    );
  }

}

Search.propTypes = {
  dispatch: PropTypes.func.isRequired,
  location: PropTypes.object.isRequired,
  channels: PropTypes.array.isRequired,
  podcasts: PropTypes.array.isRequired,
  isLoading: PropTypes.bool.isRequired,
  searchQuery: PropTypes.string.isRequired,
  searchType: PropTypes.string.isRequired,
};

const mapStateToProps = state => {
  const { isLoading } = state.podcasts;
  const { query, type } = state.search;
  const { isLoggedIn } = state.auth;

  const podcasts = podcastsSelector(state);
  const { channels } = channelsSelector(state);

  return {
    searchQuery: query,
    searchType: type,
    podcasts,
    channels,
    isLoading,
    isLoggedIn,
  };
};

export default connect(mapStateToProps)(Search);
