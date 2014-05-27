(function() {
    'use strict';

    // Add the custom locator.
    by.addLocator('buttonText', function(buttonText, opt_parentElement) {
        // This function will be serialized as a string and will execute in the
        // browser. The first argument is the text for the button. The second
        // argument is the parent element, if any.
        var using = opt_parentElement || document,
            buttons = using.querySelectorAll('button');

        // Return an array of buttons with the text.
        return Array.prototype.filter.call(buttons, function(button) {
            return button.textContent === buttonText;
        });
    });

    // protractor.getInstance().ignoreSynchronization = true;

    // browser.driver.manage().timeouts().implicitlyWait(30000);
}());