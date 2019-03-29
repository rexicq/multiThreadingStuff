const Page = require('./utils/page');

let page;

beforeEach(async () => {
  page = await Page.build();
  await page.goto('http://localhost:3000')
});

afterEach(async () => {
  await page.close()
});

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });

  test('can see blog create form', async () => {
    const label = await page.getContentsOf('form label');

    expect(label).toEqual('Blog Title');
  });

  describe('using valid inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'Title');
      await page.type('.content input', 'Content');
      await page.click('form button');
    });

    test('Submitting takes user to review screen', async () => {
      const text = await page.getContentsOf('h5');

      expect(text).toEqual('Please confirm your entries');
    });


    test('Submitting takes user to review screen', async () => {
      await page.click('button.green');
      await page.waitFor('.card');

      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');

      expect(title).toEqual('Title');
      expect(content).toEqual('Content');
    });
  });

  describe('Using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button')
    });
    test('the form shows an error', async () => {
      const titleErr = await page.getContentsOf('.title .red-text');
      const contentErr = await page.getContentsOf('.content .red-text');

      expect(titleErr).toEqual('You must provide a value');
      expect(contentErr).toEqual('You must provide a value');
    });
  });
});

describe('User is not logged in', async () => {
  const actions = [
    {
      method: 'get',
      path: '/api/blogs'
    },
    {
      method: 'post',
      path: '/api/blogs',
      data: {
        title: 'T',
        content: 'C'
      }
    }
  ];

  test('Blog related actions', async () => {
    const results = await page.execRequests(actions);

    for (let result of results) {
      expect(result).toEqual({error: 'You must log in!'})
    }
  });
});