var cheerio = require('cheerio');

describe("jQuery.fn.inspect", function(){
  it("returns the outer HTML of the first matched element", function(){
    cheerio.load('<div class="foo"></div>').root().inspect().should.equal('<div class="foo"></div>');
  });

  it("respects depth", function(){
    cheerio.load('<div class="foo"><one><two><three></three></two><two>Three</two></one></div>').root().inspect(2)
      .should.equal('<div class="foo"><one><two>...</two><two>...</two></one></div>');
  });
});
