import {fromJS} from 'immutable';
import {
  TRAIT_TARGET_TYPE
  , TRAIT_COOLDOWN_DURATION
  , TRAIT_COOLDOWN_PLACE
  , TRAIT_COOLDOWN_LINK
  , CARD_TARGET_TYPE
  , TRAIT_ANIMAL_FLAG
} from '../constants';

import {
  server$startFeeding
  , server$traitActivate
  , server$traitStartCooldown
  , server$traitAnimalRemoveTrait
  , server$traitGrazeFood
  , server$traitSetAnimalFlag
  , server$traitNotify_End
  , server$traitConvertFat
  , server$tryViviparous
} from '../../../../actions/actions';

import {getRandom} from '../../../../utils/randomGenerator';

//

import {TraitCarnivorous, endHunt} from './TraitCarnivorous';

export {TraitCarnivorous};
export * from './ttf';

export const TraitWaiter = {
  type: 'TraitWaiter'
  , playerControllable: true
  , targetType: TRAIT_TARGET_TYPE.NONE
  , action: () => (dispatch) => false
};

export const TraitParasite = {
  type: 'TraitParasite'
  , cardTargetType: CARD_TARGET_TYPE.ANIMAL_ENEMY
  , food: 2
};

export const TraitFatTissue = {
  type: 'TraitFatTissue'
  , multiple: true
  , cooldowns: fromJS([
    ['TraitFatTissue', TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
    , [TRAIT_COOLDOWN_LINK.EATING, TRAIT_COOLDOWN_PLACE.PLAYER, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , targetType: TRAIT_TARGET_TYPE.NONE
  , playerControllable: true
  , action: (game, sourceAnimal, traitFatTissue) => (dispatch) => {
    dispatch(server$traitConvertFat(game.id, sourceAnimal, traitFatTissue));
    dispatch(server$traitStartCooldown(game.id, traitFatTissue, sourceAnimal));
    return true;
  }
  , $checkAction: (game, sourceAnimal, trait) => trait.value && !sourceAnimal.isSaturated()
};

//

export const TraitSwimming = {
  type: 'TraitSwimming'
};

export const TraitRunning = {
  type: 'TraitRunning'
  , action: () => getRandom(0, 1) > 0
};

export const TraitMimicry = {
  type: 'TraitMimicry'
  , targetType: TRAIT_TARGET_TYPE.ANIMAL
  , cooldowns: fromJS([
    ['TraitMimicry', TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ACTIVATION]
  ])
  , action: (game, mimicryAnimal, traitMimicry, newTargetAnimal, attackAnimal, attackTrait) => (dispatch, getState) => {
    dispatch(server$traitStartCooldown(game.id, traitMimicry, mimicryAnimal));
    return dispatch(server$traitActivate(game, attackAnimal, attackTrait, newTargetAnimal));
  }
  , getTargets: (game, attackAnimal, attackTraitData, mimicryAnimal) => {
    return game.getPlayer(mimicryAnimal.ownerId).continent.filter((animal) =>
      mimicryAnimal.id !== animal.id
      && attackAnimal.id !== animal.id
        //&& !animal.hasTrait('TraitMimicry')
      //&& (!animal.hasTrait('TraitMimicry') || animal.hasTrait('TraitMimicry') && animal.hasTrait('TraitMimicry').checkAction(game, animal))
      && attackTraitData.checkTarget(game, attackAnimal, animal)
    );
  }
};

export const TraitScavenger = {
  type: 'TraitScavenger'
  , checkTraitPlacement: (animal) => !animal.hasTrait('TraitCarnivorous')
};

//

export const TraitSymbiosis = {
  type: 'TraitSymbiosis'
  , cardTargetType: CARD_TARGET_TYPE.LINK_SELF_ONEWAY
};

export const TraitPiracy = {
  type: 'TraitPiracy'
  , targetType: TRAIT_TARGET_TYPE.ANIMAL
  , playerControllable: true
  , cooldowns: fromJS([
    ['TraitPiracy', TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TURN]
  ])
  , action: (game, sourceAnimal, traitPiracy, targetAnimal) => dispatch => {
    dispatch(server$traitStartCooldown(game.id, traitPiracy, sourceAnimal));
    dispatch(server$startFeeding(game.id, sourceAnimal, 1, 'TraitPiracy', targetAnimal.id));
    return true;
  }
  , $checkAction: (game, sourceAnimal) => sourceAnimal.canEat(game)
  , checkTarget: (game, sourceAnimal, targetAnimal) => targetAnimal.food > 0 && !targetAnimal.isSaturated()
};

export const TraitTailLoss = {
  type: 'TraitTailLoss'
  , targetType: TRAIT_TARGET_TYPE.TRAIT
  , cooldowns: fromJS([
    ['TraitTailLoss', TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ACTIVATION]
  ])
  , getTargets: (game, attackAnimal, attackTraitData, defenseAnimal) => defenseAnimal.getTraits()
  , action: (game, targetAnimal, trait, targetTrait, attackAnimal, attackTrait) => (dispatch, getState) => {
    dispatch(server$traitAnimalRemoveTrait(game, targetAnimal, targetTrait));

    dispatch(server$startFeeding(game.id, attackAnimal, 1, 'TraitTailLoss', targetAnimal.id));

    dispatch(endHunt(game, attackAnimal, attackTrait, targetAnimal));
    return true;
  }
};

export const TraitCommunication = {
  type: 'TraitCommunication'
  , cardTargetType: CARD_TARGET_TYPE.LINK_SELF
  , cooldowns: fromJS([
    ['TraitCommunication', TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: () => true
};

//

export const TraitGrazing = {
  type: 'TraitGrazing'
  , targetType: TRAIT_TARGET_TYPE.NONE
  , cooldowns: fromJS([
    ['TraitGrazing', TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , playerControllable: true
  , action: (game, sourceAnimal, traitGrazing) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, traitGrazing, sourceAnimal));
    dispatch(server$traitGrazeFood(game.id, 1, sourceAnimal));
    return true;
  }
  , $checkAction: (game, sourceAnimal) => game.food > 0
};

export const TraitMassive = {
  type: 'TraitMassive'
  , food: 1
};

export const TraitHibernation = {
  type: 'TraitHibernation'
  , cooldowns: fromJS([
    ['TraitHibernation', TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.TWO_TURNS]
  ])
  , targetType: TRAIT_TARGET_TYPE.NONE
  , playerControllable: true
  , action: (game, sourceAnimal, traitHibernation) => (dispatch) => {
    dispatch(server$traitStartCooldown(game.id, traitHibernation, sourceAnimal));
    dispatch(server$traitSetAnimalFlag(game, sourceAnimal, TRAIT_ANIMAL_FLAG.HIBERNATED));
    dispatch(server$tryViviparous(game.id, sourceAnimal));
    return true;
  }
  , $checkAction: (game, sourceAnimal) => !sourceAnimal.isFull() && game.deck.size > 0
  , onRemove: (game, animal) => dispatch(server$traitSetAnimalFlag(game, animal, TRAIT_ANIMAL_FLAG.HIBERNATED, false))
};

export const TraitPoisonous = {
  type: 'TraitPoisonous'
  , targetType: TRAIT_TARGET_TYPE.NONE
  , action: (game, sourceAnimal, trait, targetAnimal) => (dispatch) => {
    dispatch(server$traitSetAnimalFlag(game, targetAnimal, TRAIT_ANIMAL_FLAG.POISONED));
    return true;
  }
};

//

export const TraitCooperation = {
  type: 'TraitCooperation'
  , cardTargetType: CARD_TARGET_TYPE.LINK_SELF
  , cooldowns: fromJS([
    ['TraitCooperation', TRAIT_COOLDOWN_PLACE.TRAIT, TRAIT_COOLDOWN_DURATION.ROUND]
  ])
  , action: () => true
  , $checkAction: (game) => game.food > 0
};

export const TraitBurrowing = {
  type: 'TraitBurrowing'
};

export const TraitCamouflage = {
  type: 'TraitCamouflage'
};

export const TraitSharpVision = {
  type: 'TraitSharpVision'
};