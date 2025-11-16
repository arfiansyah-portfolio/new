Feature: Map Cluster

    Background:
        Given I am on the "map cluster page"

    @mapcluster
    Scenario: Verify map cluster markers are displayed correctly
        When I should see the "Map demo with optimalized K-Means algorithm"
        When I see the map cluster
        When I create list of map cluster markers
        Then I click cluster marker number "5"
        Then I verify map cluster markers match datatest list