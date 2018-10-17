import React, {PureComponent} from 'react';
import update from 'immutability-helper';
import isEqualWith from 'lodash/isEqualWith';
import PropTypes from 'prop-types';


export function stringify(it){
   // objects and arrays = JSON
   if (typeof it === 'object'){
      return JSON.stringify(it);
   }
   // undefined = ''
   if (typeof it === 'undefined'){
      return '';
   }
   // NaN, null, etc...
   return `${it}`;
}

export function compareValues(a, b, strict=false){
   return strict
      ? a === b
      : stringify(a) === stringify(b);
}

export let DraftContext = React.createContext('draft-context')
export let DraftConsumer = DraftContext.Consumer;

export default class Draft extends PureComponent{
   render(){
      let {
         original,
         children
      } = this.props;
      return typeof children === 'function'
         ? (
            <DraftProvider original={original}>
               <DraftConsumer>{
                  props => children(props)
               }</DraftConsumer>
            </DraftProvider>
         ) : children;
   }
}

export class DraftProvider extends PureComponent{
   static defaultProps = {
      stringifyCompare: true
   }

   constructor(props){
      super(props);
      this.state = {};
   }

   /**
    * gets a value by key
    */
   get = key => 
      this.state[key] === undefined
         ? this.props.original[key]
         : this.state[key]

   /**
    * sets value by key and value
    */
   set = (key, value) =>
      this.setState(
         typeof key === 'object'
         ? key
         : {[key]: value}
      )

   /**
    * Use immutability helper's update
    * syntax to update the state
    */
   update = updateObj =>
      this.setState(
         update(this.state, updateObj)
      )
   
   stringify = it => {
      // objects and arrays
      if (typeof it === 'object'){
         return JSON.stringify(it);
      }
      if (typeof it === 'undefined'){
         return '';
      }
      // NaN, null, etc...
      return `${it}`;
   }
   
   compare = (a, b) => {
      let {stringifyCompare} = this.props;
      return stringifyCompare
         ? this.stringify(a) === this.stringify(b)
         : a == b;
   }
   
   /**
    * returns an object with state of data
    * and an array of object keys that have been edited
    */
   getState = () => {
      let {original} = this.props;
      let edits = {...original};
      let keysChanged = {};
      for (let k in this.state){
         if (this.state[k] !== undefined){
            if (!this.compare(original[k], this.state[k])){
               keysChanged[k] = {
                  original: original[k],
                  edited: this.state[k]
               };
            }
            edits[k] = this.state[k];
         }
      }
      return {
         changed: keysChanged,
         state: edits
      };  
   }

   /**
    * clear changes from state
    */
   clear = () => {
      let update = {};
      for (let k in this.state){
         update[k] = undefined;
      }
      this.setState(update);
   }

   /**
    * Returns true to indicate
    * changes have been made
    */
   check = () =>
      isEqualWith(
         this.props.original,
         this.getState().state,
         this.compare
      ) ? false : true

   render(){
      let {
         props: {
            children
         },
         get,
         set,
         update,
         clear,
         check,
         getState,
      } = this;
      let {
         changed,
         state
      } = getState();

      return (
         <DraftContext.Provider
            value={{
               get,
               set,
               update,
               clear,
               check,
               state,
               changed
            }}
            children={children}
         />
      )
   }
}

