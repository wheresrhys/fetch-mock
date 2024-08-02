const __importDefault =
	(this && this.__importDefault) ||
	function (mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};
Object.defineProperty(exports, '__esModule', { value: true });
const core_1 = __importDefault(require('@fetch-mock/core'));
core_1.default.route('http://example.com', 200);
const fetch_mock_1 = __importDefault(require('fetch-mock'));
fetch_mock_1.default.mock('http://example.com', 200);
