module.exports = function (chai, utils) {
  var cheerio = require('cheerio');

  var inspect = utils.inspect,
      flag = utils.flag;

  var setPrototypeOf = '__proto__' in Object ?
    function (object, prototype) {
      object.__proto__ = prototype;
    } :
    function (object, prototype) {
      var excludeNames = /^(?:length|name|arguments|caller)$/;

      function copyProperties(dst, src) {
        Object.getOwnPropertyNames(src).forEach(function (name) {
          if (!excludeNames.test(name)) {
            Object.defineProperty(dst, name,
              Object.getOwnPropertyDescriptor(src, name));
          }
        });
      }

      copyProperties(object, prototype);
      copyProperties(object, Object.getPrototypeOf(prototype));
    };

  cheerio.prototype.inspect = function (depth) {
    var el = cheerio.load('<div></div>')('div').append(this.clone());
    if (depth !== undefined) {
      var children = el.children();
      while (depth-- > 0)
        children = children.children();
      children.html('...');
    }
    return el.html();
  };

  var props = {attr: 'attribute', css: 'CSS property', prop: 'property'};
  for (var prop in props) {
    (function (prop, description) {
      chai.Assertion.addMethod(prop, function (name, val) {
        var actual = flag(this, 'object')[prop](name);

        if (!flag(this, 'negate') || undefined === val) {
          this.assert(
              undefined !== actual
            , 'expected #{this} to have a #{exp} ' + description
            , 'expected #{this} not to have a #{exp} ' + description
            , name
          );
        }

        if (undefined !== val) {
          this.assert(
              val === actual
            , 'expected #{this} to have a ' + inspect(name) + ' ' + description + ' with the value #{exp}, but the value was #{act}'
            , 'expected #{this} not to have a ' + inspect(name) + ' ' + description + ' with the value #{act}'
            , val
            , actual
          );
        }

        flag(this, 'object', actual);
      });
    })(prop, props[prop]);
  }

  chai.Assertion.addMethod('data', function (name, val) {
    // Work around a chai bug (https://github.com/logicalparadox/chai/issues/16)
    if (flag(this, 'negate') && undefined !== val && undefined === flag(this, 'object').data(name)) {
      return;
    }

    var assertion = new chai.Assertion(flag(this, 'object').data());
    if (flag(this, 'negate'))
      assertion = assertion.not;
    return assertion.property(name, val);
  });

  chai.Assertion.addMethod('class', function (className) {
    this.assert(
        flag(this, 'object').hasClass(className)
      , 'expected #{this} to have class #{exp}'
      , 'expected #{this} not to have class #{exp}'
      , className
    );
  });

  chai.Assertion.addMethod('id', function (id) {
    this.assert(
        flag(this, 'object').attr('id') === id
      , 'expected #{this} to have id #{exp}'
      , 'expected #{this} not to have id #{exp}'
      , id
    );
  });

  chai.Assertion.addMethod('html', function (html) {
    var actual = flag(this, 'object').html();
    this.assert(
        actual === html
      , 'expected #{this} to have HTML #{exp}, but the HTML was #{act}'
      , 'expected #{this} not to have HTML #{exp}'
      , html
      , actual
    );
  });

  chai.Assertion.addMethod('text', function (text) {
    var actual = flag(this, 'object').text();
    this.assert(
        actual === text
      , 'expected #{this} to have text #{exp}, but the text was #{act}'
      , 'expected #{this} not to have text #{exp}'
      , text
      , actual
    );
  });

  chai.Assertion.addMethod('value', function (value) {
    var actual = flag(this, 'object').val();
    this.assert(
        flag(this, 'object').val() === value
      , 'expected #{this} to have value #{exp}, but the value was #{act}'
      , 'expected #{this} not to have value #{exp}'
      , value
      , actual
    );
  });

  chai.Assertion.addMethod('descendants', function (selector) {
    this.assert(
        flag(this, 'object').has(selector).length > 0
      , 'expected #{this} to have #{exp}'
      , 'expected #{this} not to have #{exp}'
      , selector
    );
  });

  ['selected', 'checked', 'enabled', 'disabled'].forEach(function (attr, i) {
    chai.Assertion.addProperty(attr, function () {
      this.assert(
          flag(this, 'object').is(':' + attr)
        , 'expected #{this} to be ' + attr
        , 'expected #{this} not to be ' + attr);
    });
  });

  chai.Assertion.overwriteProperty('exist', function (_super) {
    return function () {
      var obj = flag(this, 'object');
      if (obj instanceof cheerio) {
        this.assert(
            obj.length > 0
          , 'expected element to exist'
          , 'expected element not to exist');
      } else {
        _super.apply(this, arguments);
      }
    };
  });

  chai.Assertion.overwriteProperty('empty', function (_super) {
    return function () {
      var obj = flag(this, 'object');
      if (obj instanceof cheerio) {
        this.assert(
          obj.is(':empty')
          , 'expected #{this} to be empty'
          , 'expected #{this} not to be empty');
      } else {
        _super.apply(this, arguments);
      }
    };
  });

  chai.Assertion.overwriteMethod('match', function (_super) {
    return function (selector) {
      var obj = flag(this, 'object');
      if (obj instanceof cheerio) {
        this.assert(
            obj.is(selector)
          , 'expected #{this} to match #{exp}'
          , 'expected #{this} not to match #{exp}'
          , selector
        );
      } else {
        _super.apply(this, arguments);
      }
    }
  });

  chai.Assertion.overwriteChainableMethod('contain',
    function (_super) {
      return function (text) {
        var obj = flag(this, 'object');
        if (obj instanceof cheerio) {
          this.assert(
              obj.is(':contains(\'' + text + '\')')
            , 'expected #{this} to contain #{exp}'
            , 'expected #{this} not to contain #{exp}'
            , text);
        } else {
          _super.apply(this, arguments);
        }
      }
    },
    function(_super) {
      return function() {
        _super.call(this);
      };
    }
  );
};
