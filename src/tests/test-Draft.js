import React from 'react';
import {mount} from 'enzyme';
import {expect} from 'chai';
import Draft from '../Draft';


const Tester = ({onChange, ...props}) =>
   Object.keys(props)
   .map(k =>
      k ? <input
         key={k}
         value={props[k].toString()}
         className={k}
         onChange={e =>
            onChange(k, e.target.value)
         }
      /> : null
   )


describe('<Draft/>', () => {
	
	let wrapper;
   
	const testData = {
      idNum: 1,
      name: "John Doe",
      company: "Place",
      phone: "777-7777"
   };

	beforeEach(() => {
		wrapper = mount(
			<Draft
            original={testData}
         >{({
            get,
            set,
            state,
            check,
            update
         }) => 
            <Tester
               onChange={set}
               checkIfEdited={check}
               getProp={get}
               updateState={update}
               {...state}
            />
         }</Draft>
      );
   })
   
   it(`initially passes original prop to children as state prop`, () => {
      const TesterEl = wrapper.find(Tester);
      for (var k in testData){
         expect(TesterEl.props()[k])
            .to.equal(testData[k])
      }
   })

   describe(`props.set(key, value)`, () => {
      it(`correctly passes new value to child through props.state`, () => {
         const newValue = "new";

         for (let k in testData){
            wrapper
               .find(`.${k}`)
               .simulate('change', {
                  target: {value: newValue}
               })

            expect(
               wrapper.find(Tester)
               .props()[k]
            ).to.equal(newValue)
         }
      })
      it(`accepts an object instead of string as first argument, updating like setState`, () => {
         const multiChange = {
            company: "Another",
            phone: "666-6666"
         };
         const merged = {
            ...testData,
            ...multiChange
         }

         wrapper.find(Tester).props().onChange(multiChange);
         for (let k in merged){
            let val = merged[k];
            expect(
               wrapper.find(Tester).props().getProp(k)
            ).to.equal(val);
         }
      })
   })

   describe(`props.get(key)`, () => {
      it(`returns the correct value from state`, () => {
         expect(
            wrapper.find(Tester).props().getProp('name')
         ).to.equal(testData.name);
      })
   })

   describe(`props.update($updateObj)`, () => {
      it(`accepts an immutability helper update object to alter state`, () => {
         wrapper.find(Tester).props().updateState({'name': {$set: "Test"}});
         expect(
            wrapper.find(Tester).props().getProp('name')
         ).to.equal("Test");
      })
   })

   describe(`props.check()`, () => {
      it(`returns false if no edits have been made`, () => {
         expect(
            wrapper.find(Tester).props().checkIfEdited()
         ).to.equal(false);
      })
      it(`returns true if an edit was made`, () => {
         expect(
            wrapper.find(Tester).props().checkIfEdited()
         ).to.equal(false);
         
         wrapper
            .find(`.name`)
            .simulate('change', {
               target: {value: ""}
            })
         expect(
            wrapper.find(Tester).props().checkIfEdited()
         ).to.equal(true);
      })
      it(`returns false if an edit was made that is equal to what was in the original`, () => {
         wrapper
            .find(`.name`)
            .simulate('change', {
               target: {value: testData.name}
            })
         expect(
            wrapper.find(Tester).props().checkIfEdited()
         ).to.equal(false);
      })
   })
	
})