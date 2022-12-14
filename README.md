[![Svelte v3](https://img.shields.io/badge/svelte-v3-orange.svg)](https://svelte.dev)
[![npm](https://img.shields.io/npm/v/svelte-log-view.svg)](https://www.npmjs.com/package/svelte-log-view)
[![License](https://img.shields.io/badge/License-BSD%203--Clause-blue.svg)](https://opensource.org/licenses/BSD-3-Clause)
[![Open Bundle](https://bundlejs.com/badge-light.svg)](https://bundlejs.com/?q=svelte-log-view)
[![downloads](http://img.shields.io/npm/dm/svelte-log-view.svg?style=flat-square)](https://npmjs.org/package/svelte-log-view)
[![GitHub Issues](https://img.shields.io/github/issues/arlac77/svelte-log-view.svg?style=flat-square)](https://github.com/arlac77/svelte-log-view/issues)
[![Build Status](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Factions-badge.atrox.dev%2Farlac77%2Fsvelte-log-view%2Fbadge\&style=flat)](https://actions-badge.atrox.dev/arlac77/svelte-log-view/goto)
[![Styled with prettier](https://img.shields.io/badge/styled_with-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)
[![Known Vulnerabilities](https://snyk.io/test/github/arlac77/svelte-log-view/badge.svg)](https://snyk.io/test/github/arlac77/svelte-log-view)
[![Coverage Status](https://coveralls.io/repos/arlac77/svelte-log-view/badge.svg)](https://coveralls.io/github/arlac77/svelte-log-view)
[![Tested with TestCafe](https://img.shields.io/badge/tested%20with-TestCafe-2fa4cf.svg)](https://github.com/DevExpress/testcafe)

# svelte-log-view

show log content

# Example

Check out the code in the [tests/app](/tests/app) folder,
or the [live example](https://arlac77.github.io/components/svelte-log-view/tests/app/index.html).

```js
  const source = {
    abort: async () => { }, //abort data fetching
    fetch: async function * f(cursor, number) // fetch entries starting after cursor
    { yield "my log entry 1"; yield "my log entry 2"; }
  };
```

Or the [live example](https://svelte-log-view.netlify.app/tests/app/).

# API

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

## Table of Contents

# install

With [npm](http://npmjs.org) do:

```shell
npm install svelte-log-view
```

With [yarn](https://yarnpkg.com) do:

```shell
yarn add svelte-log-view
```

# license

BSD-2-Clause
