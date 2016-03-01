var chai = require('chai');
var expect = chai.expect;
chai.should();

var chaiCheerio = require('../chai-cheerio.js');
chai.use(chaiCheerio)

require('./chai-cheerio-spec');
require('./cheerio-inspect-spec');
