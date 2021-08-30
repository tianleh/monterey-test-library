export class CommonUI {
  constructor(inputTestRunner) {
    this.testRunner = inputTestRunner;
  }

  /**
   * Sets the page date range
   * @param {String} start Start datetime to set
   * @param {String} end  End datetime to set
   */
  setDateRange(start, end) {
    this.testRunner.get('[data-test-subj="superDatePickerShowDatesButton"]').should('be.visible').click()

    this.testRunner.get('[data-test-subj="superDatePickerendDatePopoverButton"]').should('be.visible').click()
    this.testRunner.get('[data-test-subj="superDatePickerAbsoluteTab"]').should('be.visible').click()
    this.testRunner.get('[data-test-subj="superDatePickerAbsoluteDateInput"]').should('be.visible').type(`{selectall}${start}`)
    this.testRunner.get('[data-test-subj="superDatePickerendDatePopoverButton"]').should('be.visible').click()
    this.testRunner.get('[data-test-subj="superDatePickerAbsoluteTab"]').should('not.exist')

    this.testRunner.get('[data-test-subj="superDatePickerstartDatePopoverButton"]').should('be.visible').click()
    this.testRunner.get('[data-test-subj="superDatePickerAbsoluteTab"]').should('be.visible').click()
    this.testRunner.get('[data-test-subj="superDatePickerAbsoluteDateInput"]').should('be.visible').type(`{selectall}${end}`)
    this.testRunner.get('[data-test-subj="superDatePickerstartDatePopoverButton"]').should('be.visible').click()

    this.testRunner.get('[data-test-subj="querySubmitButton"]').should('be.visible').click()
  }

  /**
   * Attempts to add a specified filter to a dashboard, retrying by reopening the filter window
   * @param {String} field Field value to select
   * @param {String} operator Operator value to select
   * @param {String} value Value field input
   */
  addFilterRetryFull(field, operator, value = null, maxRetries = 3) {
    // Try and select the desire combo box option
    const selectComboBoxInput = (selector, keyword) => {
      this.testRunner.get(`[data-test-subj="${selector}"]`).find('[data-test-subj="comboBoxInput"]').trigger('focus').type(`{selectall}{backspace}${keyword}`)
      this.testRunner.get(`[data-test-subj="comboBoxOptionsList ${selector}-optionsList"]`).find(`[title="${keyword}"]`).trigger('click', { force: true })
    }

    // Attempt up to three times to select the desired field and operator options and input the value (if applicable)
    const tryToAddFilter = (field, operator, value = null, retry = 0) => {
      this.testRunner.wait(3000)
      this.testRunner.get('[data-test-subj="addFilter"]').click({ scrollBehavior: 'center' }).then(() => {
        selectComboBoxInput('filterFieldSuggestionList', field)
        this.testRunner.get('[data-test-subj="filterFieldSuggestionList"]').then(($field) => {
          const cls = $field.attr('class')
          if (cls.includes('euiComboBox-isInvalid') && retry < maxRetries) {
            this.testRunner.get('[data-test-subj="cancelSaveFilter"]').click()
            tryToAddFilter(field, operator, value, retry + 1)
          } else {
            selectComboBoxInput('filterOperatorList', operator)
            this.testRunner.get('[data-test-subj="filterOperatorList"]').then(($operator) => {
              const cls = $operator.attr('class')
              if (cls.includes('euiComboBox-isInvalid') && retry < maxRetries) {
                this.testRunner.get('[data-test-subj="cancelSaveFilter"]').click()
                tryToAddFilter(field, operator, value, retry + 1)
              } else {
                if (value !== null) {
                  this.testRunner.get('[data-test-subj="filterParams"]').find('input').type(value)
                }
                this.testRunner.get('[data-test-subj="saveFilter"]').click()
              }
            })
          }
        })
      })
    }
    tryToAddFilter(field, operator, value)
  }

  /**
   * Attempts to add a specified filter, retrying by reselecting the failed option
   * @param {String} field Field value to select
   * @param {String} operator Operator value to select
   * @param {String} value Value field input
   */
  addFilterRetrySelection(field, operator, value = null, maxRetries = 3) {
    const selectComboBoxInput = (selector, keyword, retry = 0) => {
      this.testRunner.get(`[data-test-subj="${selector}"]`).find('[data-test-subj="comboBoxInput"]').trigger('focus').type(`{selectall}{backspace}${keyword}`)
      this.testRunner.get(`[data-test-subj="comboBoxOptionsList ${selector}-optionsList"]`).find(`[title="${keyword}"]`).trigger('click', { force: true })
      this.testRunner.get(`[data-test-subj="${selector}"]`).then(($box) => {
        const cls = $box.attr('class')
        if (cls.includes('euiComboBox-isInvalid') && retry < maxRetries) {
          this.testRunner.wrap($box).find('[data-test-subj="comboBoxInput"]').type('{selectall}{backspace}')
          this.testRunner.wrap($box).find('[data-test-subj="comboBoxToggleListButton"]').click()
          selectComboBoxInput(selector, keyword, retry + 1)
        }
      })
    }

    this.testRunner.get('[data-test-subj="addFilter"]').click().then(() => {
      selectComboBoxInput('filterFieldSuggestionList', field)
      selectComboBoxInput('filterOperatorList', operator)
    })

    if (value != null) {
      this.testRunner.get('[data-test-subj="filterParams"]').find('input').type(value)
    }
    this.testRunner.get('[data-test-subj="saveFilter"]').click()
  }

  /**
   * Asserts that there exists a certain number of instances of an element
   * @param {String} selector Selector for element of interest
   * @param {Number} numElements Number of expected elements
   */
  checkElementExists(selector, numElements) {
    this.testRunner.get(selector).should('be.length', numElements)
  }

  /**
   * Asserts that a certain element does not exist
   * @param {String} selector Selector for element of interest
   */
  checkElementDoesNotExist(selector) {
    this.testRunner.get(selector).should('not.exist')
  }

  /**
   * Asserts that the components of a certain element does not exist
   * @param {String} mainSelector Selector for element of interest
   * @param {String} componentSelector Selector for subcomponent of interest
   */
  checkElementComponentDoesNotExist(mainSelector, componentSelector) {
    this.testRunner.get(mainSelector).find(componentSelector).should('not.exist')
  }

  /**
   * Asserts that each element of a given selector contains a certain value
   * @param {String} selector Selector for element of interest
   * @param {Number} numElements Number of expected elements to be returned
   * @param {String} value Regex value
   */
  checkElementContainsValue(selector, numElements, value) {
    this.testRunner.get(selector).should('be.length', numElements).each(($el) => {
      this.testRunner.get($el).contains(new RegExp(`^${value}$`))
    })
  }

  /**
   * Asserts that each element of a given selector has components that contain a certain value
   * @param {String} mainSelector Selector for element of interest
   * @param {String} componentSelector Selector for subcomponent of interest
   * @param {Number} numElements Number of expected elements to be returned
   * @param {String} value Regex value
   */
  checkElementComponentContainsValue(mainSelector, componentSelector, numElements, value) {
    this.testRunner.get(mainSelector).should('be.length', numElements).each(($el) => {
      this.testRunner.get($el).find(componentSelector).contains(new RegExp(`^${value}$`))
    })
  }

  /**
   * Asserts each value in an array of strings is contained within an element
   * @param {String} selector Selector for element of interest
   * @param {Array} values Array of string values
   */
  checkValuesExistInComponent(selector, value) {
    this.testRunner.wrap(value).each((str) => {
      this.testRunner.get(selector).contains(new RegExp(`^${str}$`))
    })
  }
}