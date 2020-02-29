import * as PKG from '../src';

const { fromGoogleSheets, fromUrl } = PKG;

test('googlesheets', async () => {
  const vocab = await fromGoogleSheets(
    'https://docs.google.com/spreadsheets/d/1anSwqUony4cnsDFT0BUNUkZnTiDtDOO3I7XmmF4vXyo',
  );
});
