import React from 'react';
import {mount, shallow} from 'enzyme';
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
   let onClick, onChange;
   
	const testData = {
      idNum: 1,
      name: "John Doe",
      company: "Place",
      phone: "777-7777"
   };

	beforeEach(() => {
		// onClick = sinon.spy();
		// onChange = sinon.spy();
		wrapper = mount(
			<Draft
            original={testData}
         >{({
            get, set, state, check
         }) => 
            <Tester
               onChange={set}
               checkIfEdited={check}
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