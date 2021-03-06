import React from 'react'

import { createDevTools } from 'redux-devtools'
import LogMonitor from 'redux-devtools-log-monitor'
import DockMonitor from 'redux-devtools-dock-monitor'
import Dispatcher from 'redux-devtools-dispatch'

import {List} from 'immutable';
import {CardModel} from '../../shared/models/game/CardModel';
import {CardCamouflage} from '../../shared/models/game/evolution/cards/index';
import {gameGiveCards} from '../../shared/actions/actions';

export const DevTools = createDevTools(
  <DockMonitor toggleVisibilityKey="ctrl-h" changePositionKey="ctrl-q" changeMonitorKey="ctrl-m">
    {/*<Dispatcher initEmpty={true} actionCreators={{
      gameGiveCards: (count) => (dispatch, getState) => {
        const gameId = getState().getIn(['game', 'id']);
        const userId = getState().getIn(['user', 'id']);
        dispatch(gameGiveCards(gameId, userId, CardModel.generate(count, CardCamouflage.type)));
      }
      , gameGiveCardsRandom: (count) => (dispatch, getState) => {
        const gameId = getState().getIn(['game', 'id']);
        const players = getState().getIn(['game', 'players']);
        const userId = players.toList().get(Math.floor(Math.random() * players.size)).id;
        dispatch(gameGiveCards(gameId, userId, CardModel.generate(count, CardCamouflage.type)));
      }
    }}/>*/}
    <LogMonitor/>
  </DockMonitor>
);