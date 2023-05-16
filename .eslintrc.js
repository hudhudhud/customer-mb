// http://eslint.org/docs/user-guide/configuring
module.exports = {
    "root": true,
    "env": {
        "node": true
    },
    "extends": [
        "plugin:vue/essential"
    ],
    "rules": {
        "arrow-parens": 0,
        "generator-star-spacing": 0,
        "no-debugger": 2,
        "block-scoped-var": 2,
        "no-multi-spaces": 0
    },
    "parserOptions": {
        "parser": "babel-eslint"
    }
}
