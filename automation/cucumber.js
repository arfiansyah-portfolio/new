module.exports = {
    default: {
        require: [
            "src/step-definitions/**/*.ts",
            "src/support/**/*.ts"
        ],
        requireModule: ["ts-node/register"],
        format: [
            "allure-cucumberjs/reporter"
        ],
        formatOptions: {
            resultsDir: "reports/allure-results",
            snippetInterface: "async-await"
        },
        publishQuiet: true,
        parallel: 1,
        retry: 0
    }
}
