module.exports = {
    globals: {
        Parse: false
    },
    env: {
        node: true,
        es6: true
    },
    // sets global vars for specific env - window, require, modules etc.

    parserOptions: { ecmaVersion: 8 },

    extends: ["airbnb-base", "prettier"],
    // airbnb-base - the rules we use, from dependency eslint-config-airbnb-base
    // eslint-config prefix can be and is omitted
    // we can modify the rules below
    // airbnb JS style guide with reasoning - https://github.com/airbnb/javascript
    //
    // prettier = eslint-config-prettier
    // disables styling rules from ESLint
    // prettier will handle them for us
    // prettier rules can be set in editor config (.vscode in our case) or in .prettierrc file
    // more in docs - https://prettier.io/docs/en/options.html

    rules: {
        "global-require": 0,
        "import/no-extraneous-dependencies": [
            "error",
            {
                devDependencies: true,
                optionalDependencies: true,
                peerDependencies: false
            }
        ],
        "no-unused-vars": [
            "error",
            {
                vars: "local",
                args: "none"
            }
        ],
        "arrow-body-style": 0,
        "no-underscore-dangle": 0,
        "no-await-in-loop": 0,
        "no-use-before-define": ["error", { functions: false }],
        "no-restricted-syntax": [
            "error",
            {
                selector: "ForInStatement",
                message:
                    "for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array."
            },
            {
                selector: "LabeledStatement",
                message:
                    "Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand."
            },
            {
                selector: "WithStatement",
                message:
                    "`with` is disallowed in strict mode because it makes code impossible to predict and optimize."
            }
        ]
        // 'no-console': 0
        // "no-unused-expressions": 0,
    }
};

//
//
/* ------ NEEDED EDITOR EXTENSIONS ------ */
// ESLint - handles possible erros, enforces best practices
// Prettier - handles styling
//

/* ------ ESLINT RULE MODIFICATION ----- */
// google eslint [name of rule] for more info
// ESLint docs: https://eslint.org/docs/user-guide/configuring
//

/* ----- IN CASE OF NEED, HOW TO IGNORE CODE ------ */

/* ----- ESLINT IGNORE ------- */
// it is possible to ignore file and directories via config, more in docs
// IGNORE WITH COMMENTS  => https://eslint.org/docs/user-guide/configuring#disabling-rules-with-inline-comments

/* ESLINT IGNORE - BASIC USAGE */
//  /* eslint-disable */
//  alert('foo');
//  /* eslint-enable */
//

/* ------ PRETTIER IGNORE ------ */
//  A JavaScript comment of // prettier-ignore will exclude the next node
//  in the abstract syntax tree from formatting.

//  // prettier-ignore
//  matrix(
//   1, 0, 0,
//   0, 1, 0,
//   0, 0, 1
//  )
