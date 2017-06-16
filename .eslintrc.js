
module.exports = {
    root: true,
    'env': {
        'browser': true,
        'es6': true
    },
    'extends': 'eslint:recommended',
    'rules': {
        'indent': [
            'error',
            4
        ],
        'quotes': [
            'error',
            'single',
            {"allowTemplateLiterals": true}
        ],
        'semi': [
            'error',
            'always'
        ],
    },
    globals: {
        GM_addStyle: false,
        GM_info: false,
        unsafeWindow: false,
    }
};
