import SortView from '@view/sort/sort';
import EventListContainerView from '@view/event-list-container';
import NoEventsView from '@view/no-events';
import EventPresenter from '@presenter/event';
import {render} from '@utils/render';
import {updateItem} from '@utils/common';
import {RenderPosition, SortType} from 'consts';
import {getEventsByTime, getEventsByPrice, getEventsByDate} from '@utils/sort';
import {remove} from '@utils/render';

export default class Trip {
  constructor(tripContainer) {
    this._tripContainer = tripContainer;
    this._eventPresenter = {};

    this._defaultSort = SortType.DAY;
    this._currentSort = null;

    this._eventListContainerComponent = new EventListContainerView();
    this._noEventsComponent = new NoEventsView();

    this._handleEventDataChange = this._handleEventDataChange.bind(this);
    this._handleEventModeChange = this._handleEventModeChange.bind(this);
    this._handleSortTypeChange = this._handleSortTypeChange.bind(this);
    this._handleEventDelete = this._handleEventDelete.bind(this);
  }

  init(trip) {
    this._trip = trip;

    this._renderTrip(this._defaultSort);
  }

  _renderSort(activeSort) {
    this._sortComponent = new SortView(activeSort);

    render(this._tripContainer, this._sortComponent, RenderPosition.BEFOREEND);
    this._sortComponent.setSortClickHandler(this._handleSortTypeChange);
  }

  _renderEventListContainer() {
    render(this._tripContainer, this._eventListContainerComponent, RenderPosition.BEFOREEND);
  }

  _renderEvent(event) {
    const eventPresenter = new EventPresenter(this._eventListContainerComponent, this._handleEventDataChange, this._handleEventModeChange, this._handleEventDelete);
    eventPresenter.init(event);
    this._eventPresenter[event.id] = eventPresenter;
  }

  _deleteEvent(event) {
    const id = event.id;
    const index = this._trip.findIndex((item) => {
      return item === event;
    });

    this._eventPresenter[id].destroy();
    delete this._eventPresenter[id];
    this._trip.splice(index, 1);
  }

  _renderEventList() {
    this._trip.forEach((event) => this._renderEvent(event));
  }

  _renderNoEvents() {
    render(this._eventListContainerComponent, this._noEventsComponent, RenderPosition.BEFOREEND);
  }

  _renderTrip(actualSort) {
    this._sortEvents(actualSort);
    this._renderSort(actualSort);
    this._renderEventListContainer();

    if (this._trip.length) {
      this._renderEventList();
      return;
    }

    this._renderNoEvents();
  }

  _clearEventList() {
    Object
      .values(this._eventPresenter)
      .forEach((presenter) => presenter.destroy());
    this._eventPresenter = {};
  }

  _sortEvents(sortType) {
    switch(sortType) {
      case SortType.TIME:
        this._trip = getEventsByTime(this._trip);
        break;
      case SortType.PRICE:
        this._trip = getEventsByPrice(this._trip);
        break;
      case SortType.DAY:
        this._trip = getEventsByDate(this._trip);
        break;
      default:
        this._trip = getEventsByDate(this._trip);
    }

    this._currentSort = sortType;
  }

  _handleEventDataChange(updatedEvent) {
    this._trip = updateItem(this._trip, updatedEvent);
    this._eventPresenter[updatedEvent.id].init(updatedEvent);
  }

  _handleEventModeChange() {
    Object
      .values(this._eventPresenter)
      .forEach((presenter) => presenter.resetView());
  }

  _handleSortTypeChange(newSort) {
    if (this._currentSort === newSort) {
      return;
    }

    if (newSort === SortType.EVENT || newSort === SortType.OFFERS) {
      return;
    }

    remove(this._sortComponent);
    remove(this._eventListContainerComponent);

    this._clearEventList();
    this._renderTrip(newSort);
  }

  _handleEventDelete(event) {
    this._deleteEvent(event);
  }
}
