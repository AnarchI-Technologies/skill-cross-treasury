export function out(value) {
  console.log(JSON.stringify(value, null, 2));
}

export function fail(message, extra = {}) {
  const err = new Error(message);
  err.extra = extra;
  throw err;
}

export function handleMain(promise) {
  promise.catch((err) => {
    console.error(`ERROR: ${err?.message || String(err)}`);
    if (err?.extra && Object.keys(err.extra).length) {
      console.error(JSON.stringify(err.extra, null, 2));
    }
    if (process.env.DEBUG) console.error(err?.stack ?? String(err));
    process.exit(1);
  });
}
