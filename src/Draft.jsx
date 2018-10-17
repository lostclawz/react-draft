import React, {PureComponent} from 'react';
import update from 'immutability-helper';
import isEqualWith from 'lodash/isEqualWith';
import PropTypes from 'prop-types';


const stringify = it => {
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

const compareValues = (a, b, strict=false) =>
   strict ? a === b : stringify(a) === stringify(b)

const DraftContext = React.createContext('draft-context')
const DraftConsumer = DraftContext.Consumer;


class Draft extends PureComponent{
   static propTypes = {
      original: PropTypes.object,
      children: PropTypes.func
   }
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

class DraftProvider extends PureComponent{
   
   static propTypes = {
      stringifyCompare: PropTypes.bool
   }

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
   
   compare = (a, b) => {
      let {stringifyCompare} = this.props;
      return compareValues(a, b, !stringifyCompare)
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

export {
   DraftProvider,
   DraftContext,
   DraftConsumer,
   Draft,
   stringify,
   compareValues
}
export default Draft;