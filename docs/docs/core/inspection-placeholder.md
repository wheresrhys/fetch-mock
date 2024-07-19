
Note that if you use matchers that target anything other than the url string, you may also need to add a `name` to your matcher object so that a) you can add multiple mocks on the same url that differ only in other properties (e.g. query strings or headers) b) if you [inspect](#api-inspectionfundamentals) the result of the fetch calls, retrieving the correct results will be easier.
