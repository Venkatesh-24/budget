
// Modules are created to keep pieces of code that are related to one another inside seperate independant and organised units

// private variables/methods - only accessible inside of the module so that no other code can overwrite our data This ensures safety for our code 
// public variables/methods - exposed to the public so that other functions or modules can access them

// This is called data encapsulation which allows us to hide the implementation details of a module from outside scope so that
// we only expose a public interface also called API

// BUDGET CONTROLLER
var budgetController = (function(){
/*
	var x = 23;

	var add = function(a){
		return x + a;
	}

	return {
		publicTest: function(b){
			return add(b);
		}
	}
*/


	// we need a data model for incomes and expenses we know that each item will have description and value we also know that we
	// should have a way to disinguish between diff incomes and expenses so we want them to have an unique id The best way to 
	// store them is an object but here we have to create lots of objects so we create function constructors which we then use to 
	// instantiate lots of expense and income objects

	var Expense = function(id,description,value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	}; 

	var Income = function(id,description,value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	Expense.prototype.calcPercentage = function(totalIncome){

		if(totalIncome > 0)
		{
			this.percentage = Math.round((this.value / totalIncome) * 100);
		}
		else
		{
			this.percentage = -1;
		}
		
	};

	Expense.prototype.getPercentage = function(){
		return this.percentage;
	};

	var calculateTotal = function(type) {

		var sum = 0

		data.allItems[type].forEach(function(current) {
			sum = sum + current.value;
		});

		data.totals[type] = sum;

	};

	// The best way to store the incomes and expenses into an array as there will more expenses and incomes
	// Instead of putting allincomes, allexpenses, totalincomes, totalexpenses into seperate varaibles we can aggregate 
	// these all details into one data structure and it is best practice to have one data structure where all data goes 
	// instead of having random varaibles flowing around

	var data = {
		allItems: {
			exp: [],
			inc: []
		},

		totals: {
			exp: 0,
			inc: 0
		},

		budget: 0,

		percentage: -1

	};

	return {
		addItem: function(type,des,val) {
			var newItem, ID;

			// ID is a unique number if we use length of the array + 1 as ID it would be correct but as soon as we remove an
			// element from the array then its length decreases then there is a change of two elements having the same ID so
			// the best is to choose the last id in the array bcoz that would have the largest ID number and add 1 in that 
			// case we dont have any such problems

			// Create new ID
			if(data.allItems[type].length > 0) {
				ID = data.allItems[type][data.allItems[type].length-1].id + 1;
			}
			else {
				ID = 0;
			}
			

			// Create new item based on 'inc' or 'exp' type
			if(type === 'exp'){
				newItem = new Expense(ID,des,val);
			}
			else{
				newItem = new Income(ID,des,val);
			}
			
			// Push it into our data structure
			data.allItems[type].push(newItem);

			// Return the new element
			return newItem;
		},

		deleteItem: function(type,id) {

			var ids, index;

			// Map also recieves a call back function which also has access to the current element, current index and the entire
			// array but the diff btw map and foreach is map returns a brand new array
			// Use map to traverse the exp or inc array and return an array containing only the ids of the inc or exp array

			ids = data.allItems[type].map(function(current) {
				return current.id;
			});

			// use indexOf to find the index of the id to be deleted

			index = ids.indexOf(id); // can be -1 if the search id is not found in the array

			// Delete the item from the array using the index we found and the splice method
			// splice 1st argument position where we want to start deleting and 2nd argument how many elements we want to delete

			if(index !== -1)
			{
				data.allItems[type].splice(index,1);
			}

		},

		calculateBudget: function() {

			// 1. Calculate total income and expenses
			calculateTotal('exp');
			calculateTotal('inc');

			// 2. Calculate the budget (income - expense)
			data.budget = data.totals.inc - data.totals.exp;

			// 3. Calculate the percentage of income that we spent

			if(data.totals.inc > 0)
			{
				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			}
			else 
			{
				data.percentage = -1;
			}

		},

		calculatePercentages: function(){

			data.allItems.exp.forEach(function(cur){
				cur.calcPercentage(data.totals.inc);
			});

		},


		getPercentages: function(){

			var allPerc = data.allItems.exp.map(function(cur){

				return cur.getPercentage();

			});

			return allPerc;

		},


		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},

		testing: function() {
			console.log(data);
		}
	};

 
})();


// Module is created with IIFE and Closures and the above function is an IIFE(enclosed in parenthesis and immediately called)
// the x variable and add cannot be accessed from outside as they are private variables but the module returns an object containing
// all of the functions that we want to be public


// This publicTest method is the one which is return so it is the one that gets assigned to the budget Controller varaible
// and this publicTest method is able to use the var x and function add even returning because of Closures


// UI CONTROLLER
var UIController = (function(){

	var DOMstrings = {				// we are creating an object and storing class names in varaibles because if we change the class names in the entire UI then we change can change it here in DOMstrings instead of changing it in each and every place we used the class names
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel: '.budget__income--value',
		expensesLabel: '.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'

	}

	var formatNumber = function(num,type) {

			var intpart, decpart, numsplit;

			// 1. First we use the abs() to remove the - sign if present and make it a pos number 
			num = Math.abs(num);

			// 2. Use the toFixed() of number object to specify the decimal point
			// ex - toFixed(2) 2356.4569 -> 2356.46
			// ex - toFixed(2) 2000 -> 2000.00 if it is an integer then it ll add a decimal point and place 2 zeroes after it
			num = num.toFixed(2);

			// 3. Comma Seperating the thousands- use split()
			numsplit = num.split('.');

			intpart = numsplit[0];

			// intpart is a string so we can use length() on it and also substring method accepts 2 arguments first the position
			// where to start and second how many characters to append from there

			if(intpart.length > 3)
			{
				// ex if 2350 - 2,350 and 23500 - 23,500 so in case of thousands there should be 3 digits or characters after
				// comma so we use intpart.length - 3 and there we add a comma and then add the remaining digits

				intpart = intpart.substr(0,intpart.length-3) + ',' + intpart.substr(intpart.length-3,3); 
			}

			decpart = numsplit[1];


			console.log((type === 'exp' ? '-' : '+') + ' ' + intpart + '.' + decpart);
			return (type === 'exp' ? '-' : '+') + ' ' + intpart + '.' + decpart; 


		};

		var nodeListForEach = function(list, callback) {

				for(i = 0; i < list.length; i++)
				{
					callback(list[i],i);
				}

			};


	return {
		getinput: function() {
			return {
				type: document.querySelector(DOMstrings.inputType).value,	// This is select element and not normal input element it works diff in normal input elements we get the value that is written in the browser but in select we get the values that are specified. so if first one(+) is selected we get "inc" and if the second one(-) is selected we get "exp" 
			    description: document.querySelector(DOMstrings.inputDescription).value,
			    value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
			};
			
		},

		addListItem: function(obj, type) {
			var html,newHtml,element;

			// Create HTML string with placeholder text as we want the the items to appear exactly where we wanted in our page
			// we copy the entire html element for inc or exp based on the type and enclose it in single quotes to make it a 
			// javascript string

			if(type === 'inc') {
				element = DOMstrings.incomeContainer;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			else if(type === 'exp') {
				element = DOMstrings.expensesContainer;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">10%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			
			// Replace the placeholder text with some actual data ex %value% , %id% and %description%
			// since html variable is a string we can use string methods with this varaible

			newHtml = html.replace('%id%',obj.id);
			newHtml = newHtml.replace('%description%', obj.description); // here we write newHtml.replace and not html.replace because we want to modify the lastly modified html which is the newHtml and not the orginal html string
			newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

			// Insert the HTML into the DOM using insertAdjacentHTML method which accepts the position as first arg and html 
			// string as second arg there are 4 diff positions. Here we use beforeend position bcoz we add the item in expenses__list
			// container and in there will be a lot of child elements 
			// 1.beforebegin - before the element itself
			// 2.afterbegin - just inside the element,before its first child
			// 3.beforeend- just inside the element after its last child
			// 4.afterend - after the element itself

			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

		},

		deleteListItem: function(selectorID) {

			// Removing something from the DOM is done by removeChild method so since it is a removeChild method so we need
			// to know the parent so basically we have to move up in the DOM we can then remove the child. In JAVASCRIPT
			// we cannot simply delete an element we can only delete(remove) a child

			var el = document.getElementById(selectorID);

			el.parentNode.removeChild(el);

		},

		clearFields: function(){
			
			var fields, fieldsArr;

			// QuerySelectorAll selects multiple Html elements seperated by a , and returns the result as a list
			fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

			// We have to convert the list to array to loop over it using forEach For that we use Array's slice()
			// slice() returns a copy of the array that its called on usually we call this method on array and it returns 
			// another array but we can trick and pass a list into it and then it will still return an array. We have to 
			// call this slice method using the call method and then passing the fields variable into it so that it becomes
			// this variable and then it will work. slice() method is present in the array's prototype
			fieldsArr = Array.prototype.slice.call(fields);

			// Use forEach to loop over fieldsArr Like the keypress event having an argument (event) in the callback function
			// forEach has an anonymous(call back function) which accepts 3 arguments (current - element of the array that 
			// is currently being processed, index - number going from 0 to length of the array-1, array - the entire array)
			fieldsArr.forEach(function(current,index,array){
				current.value = "";
			});

			// After we type des and val in the UI the focus(pointer) will be in the val bcoz we typed it atlast so to change
			// the focus back to des we use focus()

			fieldsArr[0].focus();

		},

		displayBudget: function(obj) {

			obj.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget,type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp,'exp');

			if(obj.percentage > 0)
			{
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			}
			else
			{
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';	
			}	
		},

		displayPercentages: function(percentages){

			// we dont know how many expense item will be on the list so we cannot use querySelector because that only selects 
			// the first one and we should use querySelectorAll and it returns a list called node list bcoz in DOM tree each
			// element is called a Node

			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

			// we have to traverse this fields node list and change the text content but we cannot use forEach method for this
			// bcoz its only available for arrays. so we create our own forEach function for nodes instead of arrays 



			// when we call the below function the above function gets called and the callback function below gets assigned
			// to the callback varaible of the above function then for each iteration of the for loop in the above funvtion
			// the callback function is called by passing the current value and the index and the code inside the below function
			// gets executed. if there are 5 elements in the fields varaible then the above for loop gets executed five times 
			// each time calling the callback function and thereby the code below gets executed 5 times

			nodeListForEach(fields, function(current,index){

				if(percentages[index] > 0)
				{
					current.textContent = percentages[index] + '%';
				}
				else
				{
					current.textContent = '---';
				}

			});

		},

		displayDate: function() {

			var now, month, months, year;
			// we can get current date by using the date object constructor and if we dont specify any arguments 
			// we get the current date

			now = new Date();

			// var christmas = new Date(2016,11,25); month is 11 instead of 12 bcoz its zero based so 11 -> december

			year = now.getFullYear(); // gives full like 2020 instead of 20

			months = ['January','Feburary','March','April','May','June','July','August','September','October',
			'November','December'];

			month = now.getMonth(); // returns the month in number(0 based) ex 11 -> december

			document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

		},


		changeType: function(){

			// We want to change the outline of the select box(type selector) and other two input fields(description and
			// value) to red if it is an exp so there is a class defined in stylesheet to change the outline we add 
			// that class to these 3 boxes using classList and toggle since there are 3 elements to change we use the
			// querySelectorAll and call our own forEach method which we defined to traverse the Nodes because querySelectorAll
			// returns result in the form of NodeList

			var fields = document.querySelectorAll(
										DOMstrings.inputType + ',' +
										DOMstrings.inputDescription + ',' + 
										DOMstrings.inputValue
									 );


			nodeListForEach(fields,function(current){

				// we use toggle bcoz what it does is if red-focus class is present on the current element then it removes it
				// and if the red-focus class is not present on the currern element then it adds the red-focus class to it

				current.classList.toggle('red-focus');


			});	

			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');

		},

		getDOMstrings: function() {				// Here we are returning the DOMstrings to make it accessible by other Controllers instead of copying the same code there
			return DOMstrings;
		}
	}

})();


// The above two modules we created are independant of each other and there is no interaction between them
// Later if we want to create a more complex budget app then we can expand only the budgetController module and not think 
// about the UIController. This is known as seperation of concerns which means each part should only be interested in
// doing one thing independantly

// So to connect these two modules that is to read data from the UI and then add that data as an expense in budgetContoller
// we use appController module


// GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl,UICtrl){
/*
	var z = budgetCtrl.publicTest(5);

	return {
		anotherPublic: function(){
			console.log(z);
		}
	}

*/ 
	// To add or set up these event listeners we need to call this setupEventListeners function because now all the eventListeners are inside a function so we use a init function to call them

	var setupEventListeners = function() {

		var DOM = UICtrl.getDOMstrings();	// we put it inside the eventListeners function bcoz we only need this here for our eventListeners to select class names

		// we directly specify the ctrlAddItem function as a call back function instead of specifying it inside the anonymous
	    // function. we dont include () because it is a call back function and addEventListener method calls it for us
	    // when needed so when someone clicks the btn
 
		document.querySelector(DOM.inputBtn).addEventListener('click',ctrlAddItem);


		// we dont want these five steps to happen only when someone clicks the btn but also when enter key is pressed

		// For a keypress event we are not going to select anything we are going to add the event listener to the global document
		// because this keypress event does not happen on any specific element but it happens on the global document(anywhere on the document)
		// This keypress event is for any key that is pressed but we want to execute the code when enter is pressed and not some random key

		// This function we passed here can recieve an argument(event argument).This event has a lot of properties and prototypes that
		// can be used with it. The important one is keycode event which has a number and this number identifies the key that we
		// pressed. The keycode for enter is 13 

		document.addEventListener('keypress',function(event){

		//	console.log(event);

		if(event.keyCode === 13 || event.which === 13)
		{
			ctrlAddItem();
		}

	  });

		// We use Event delegation because there are more income and expense items so we cannot add an eventListener for each 
		// and also these items are not visible when we load the html page so we cannot select it using querySelector

		// Event delegation allows to add EventListener to the parent element of the target element(button clicked) and 
		// when the trigger(click event) bubbles up till the root of the html element(event bubbling) we can find the 
		// target element by using the target property of event object

		document.querySelector(DOM.container).addEventListener('click',ctrlDeleteItem);


		// we use change event to change the textbox outline colour to red if it is an expense and be the same colour
		// (green) if it is an income

		// change event gets triggered when the type + changes to - and when - changes to +

		document.querySelector(DOM.inputType).addEventListener('change',UICtrl.changeType);

	}

	var updateBudget = function(){

		// 1. Calculate the budget
		budgetCtrl.calculateBudget();

		// 2. Return the budget
		var budget = budgetCtrl.getBudget();

		// 3. Display the budget on the UI
		UICtrl.displayBudget(budget);
	};


	var updatePercentages = function(){

		// 1. Calculate the percentages

			budgetCtrl.calculatePercentages();

		// 2. Read percentages from the budget controller

			var percentages = budgetCtrl.getPercentages();

		// 3. Update the UI with the new percentages

			UICtrl.displayPercentages(percentages);

	};
	

	var ctrlAddItem = function(){
		var input, newItem;

		// 1. Get the field input data
		 input = UICtrl.getinput();

		if(input.description != "" && !isNaN(input.value) && input.value > 0) {

			// 2. Add the item to the budget controller
			 newItem = budgetCtrl.addItem(input.type,input.description,input.value);

			// 3. Add the item to the UI
			 UICtrl.addListItem(newItem, input.type);

			// 4. Clear the Fields
			 UICtrl.clearFields(); 

			// 5. Calculate and Update the Budget
			 updateBudget();

			// 6. Calculate and Update the Percentages
			 updatePercentages(); 
		}
		
	};


	// The call back function of addEventListener method always has access to the event object	

	var ctrlDeleteItem = function(event) {

		var itemID, splitID, type, ID;

		// when we click on cross(remove) button on any item we actually click on the icon <i> element but we do not want to 
		// delete the button but to delete the entire item on the UI and each item is identified by its unique ID so we need 
		// to move up in the DOM whcih is called DOM traversing and it can be done by using the ParentNode property which gives
		// the Parent Node of the target element and by using it again and again we can traverse up in the DOM and atlast .id 
		// to access the ID of the particular item

		itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

		// if we click somewhere on the page we get no id(itemID will not exist) because there are no other ids in the whole
		// html document ids are present only in income and expense items

		// If itemID exists the condition inside if will be type coerced to true and if it doesnt then it is coerced to false

		if(itemID)
		{
			// split method is used to split a string based on some character and the result will be returned as an array

			splitID = itemID.split('-');
			type = splitID[0];
			ID = parseInt(splitID[1]);
		}

		// 1. Delete the item from the data structure

			budgetCtrl.deleteItem(type,ID);

		// 2. Delete the item from the UI

			UICtrl.deleteListItem(itemID);

		// 3. Update and show the new budget

			updateBudget();

		// 4. Calculate and update Percentages
		
			updatePercentages();	


	};	



	return {
		init: function() {
			console.log("App is Started");
			UICtrl.displayDate();
			UICtrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setupEventListeners();
		}
	};

})(budgetController,UIController);

// Modules can recieve arguments so we will pass the other two modules as arguments to this module so this controller
// knows about the other two controllers and can connect them

// Without using the arguments we can directly use the budgetContoller.publicTest and this makes the budgetController
// little bit less independant because if we change the name of the module then we have to change the name everywhere inside 
// this controller module 

// But if we use arguments and if we change the name of any module we just need to change it at the last while invoking 
// and then inside of the module it will always be called budgetCtrl


controller.init();