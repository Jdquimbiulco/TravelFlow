beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
});

afterAll(() => {
  if (console.error.mockRestore) {
    console.error.mockRestore();
  }
});
