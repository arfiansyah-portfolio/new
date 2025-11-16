Feature: Finance Portfolio Management

    Background:
        Given I am on the "finance portfolio page"

    @financeportofolio
    Scenario: Verify finance portfolio data matches expected values
        When I add new stock "INTC"
        When I select stock "INTC"
        When I open virtualized stock list
        Then I export virtualized stock list
        Then I validate sub table