import React, {PureComponent} from 'react';
import {isEqual} from 'lodash';
import PropTypes from 'prop-types';


export default
class Draft extends PureComponent{

   static propTypes = {
      children: PropTypes.func
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
      this.setState({
         [key]: value
      })
   
   /**
    * returns an object representing
    * current state, with edits
    */
   getState = () => ({
      ...this.props.original,
      ...this.state
   })

   /**
    * Returns true to indicate
    * changes have been made
    */
   check = () =>
      isEqual(
         this.props.original,
         this.getState()
      ) ? false : true

   render(){
      let {
         children
      } = this.props;

      return typeof children === 'function
         ? children({
            get: this.get,
            set: this.set,
            check: this.check,
            state: this.getState()
         })
         : children;
   }
}