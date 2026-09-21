describe('LingoPrep frontend test harness', () => {
  test('Jest is wired into CI', () => {
    expect('IELTS/Aptis Speaking & Writing').toContain('Speaking');
  });
});
