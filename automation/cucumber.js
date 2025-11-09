module.exports = {
    default: {
        paths: ["src/features/**/*.feature"],
        require: [
            "src/step-definitions/**/*.ts",
            "src/support/**/*.ts"
        ],
        requireModule: ["ts-node/register"],
        format: [
            "allure-cucumberjs/reporter"                   // Use summary instead of progress dots
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