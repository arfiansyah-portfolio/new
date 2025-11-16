Feature: Login
    As a user
    I want to log in
    So that I can access the dashboard

    Background:
        Given I am on the login page

    @e2e
    Scenario: Successful login
        When I login with valid credential
    # Then I should see the dashboard

    # @smoke
    # Scenario: invalid login
    #   When I login with invalid credential
    #   Then I should see the dashboard

    # @smoke
    # Scenario: login with mikro step
    #     Given I am on the login page
    #     When I fill the "Username" field
    #     And I fill the "Password" field
    #     And I click "Login"
