Feature: Piechart
    As a user
    I want to see the pie chart data
    So that I can analyze the sales distribution

    Background:
        Given I am on the "pie chart page"

    @piechart
    Scenario: Verify pie chart text labels match calculated segment percentages
        When I should not see text "Loading"
        When I click "Close Survey"
        Then I create group data by age
        Then I create percentage piechart
        Then I verify percentage piechart

    @piechart
    Scenario: Scenario: Chart correctly updates after unchecking an age group
        When I should not see text "Loading"
        When I click "Close Survey"
        When I uncheck for age group "0-14"
        Then I create group data by age
        Then I create percentage piechart
        Then I verify percentage piechart