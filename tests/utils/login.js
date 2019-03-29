const Page = require('puppeteer/lib/Page');

Page.prototype.login = async function ({session, sig}) {
  await this.setCookie({ name: 'session', value: session});
  await this.setCookie({ name: 'session.sig', value: sig});
  await this.goto('localhost:3000');
  await this.waitFor('a[href="/auth/logout"]');
};