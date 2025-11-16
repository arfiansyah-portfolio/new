Feature: Graph Chart

    Background:
        Given I am on the "graph chart page"

    @graphchart
    Scenario: Verify graph chart text labels match calculated data points
        When I create team group
        When I get data periode
        Then I search data in periode "march"
        Then I verify graph chart labels match calculated data points for periode "march"