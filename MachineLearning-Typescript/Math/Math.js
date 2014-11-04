/// <reference path="/Lib/jquery.js" />
/// <reference path="/Lib/underscore-min.js" />
/// <reference path="/Lib/underscore.string.min.js" />
/// <reference path="/Lib/knockout-min.js" />
/// <reference path="/Lib/knockout-sortable.min.js" />
$(function () {
    Math.baseLog = function (base, x) {
        return Math.log(x) / Math.log(base);
    };

    String.prototype.toHex = function () {
        if (this == '+')
            return 10;
        if (this == '-')
            return 11;
        if (this == '*')
            return 12;
        if (this == '/')
            return 13;
        return parseInt(this, 16);
    };
    String.prototype.isNumber = function () {
        return this.toHex() < 10;
    };
    Number.prototype.toHex = function () {
        return this.toString(16);
    };

    var Gene = function (code) {
        var self = this;
        self.code = ko.observable(code || '');
        self.cost = ko.observable(Number.MAX_VALUE);
        self.stringSequence = ko.observable();

        self.generate = function (length) {
            while (length--) {
                self.code(self.code() + Math.floor(Math.random() * 13).toHex());
            }
        };

        self.mutate = function (chance) {
            if (Math.random() > chance)
                return;

            var add = Math.random() <= 0.25;
            var del = Math.random() <= 0.25;

            var index = Math.floor(Math.random() * self.code().length);
            var upOrDown = Math.random() <= 0.5 ? -1 : 1;
            var distance = Math.floor(Math.random() * 3);

            var sourceChar = self.code()[index].toHex();

            var newChar = ((sourceChar + distance * upOrDown) % 13).toHex();
            var newString = '';
            for (var i = 0; i < self.code().length; i++) {
                if (i == index)
                    newString += newChar;
                else
                    newString += self.code()[i];
            }
            if (add) {
                newString += newChar;
            }
            if (del && self.code().length > 1) {
                newString = newString.split('');
                newString = newString.splice(Math.floor(Math.random() * newString.length), 1);
                newString = newString.join('');
            }
            self.code(newString);
        };

        self.mate = function (gene) {
            var pivot = Math.round(self.code().length / 2) - 1;

            var child1 = self.code().substr(0, pivot) + gene.code().substr(pivot);
            var child2 = gene.code().substr(0, pivot) + self.code().substr(pivot);

            return [new Gene(child1), new Gene(child2)];
        };

        self.calcCost = function (compareTo) {
            var value = self.value(), cost = Math.abs(parseInt(compareTo) - value);
            cost += (self.display().length - self.stringSequence().length) * 2;

            self.cost(cost);
        };

        self.decode = function (code) {
            return _.map(code, function (c) {
                switch (c.toHex()) {
                    case 10:
                        return '+';
                    case 11:
                        return '-';
                    case 12:
                        return '*';
                    case 13:
                        return '/';
                    default:
                        return c;
                }
            });
        };

        self.value = ko.computed(function () {
            var sequence = [], last = '';
            _.each(self.code(), function (next) {
                if (last.isNumber()) {
                    if (!next.isNumber()) {
                        sequence.push(next);
                        last = next;
                    }
                } else {
                    if (next.isNumber()) {
                        sequence.push(next);
                        last = next;
                    }
                }
            });
            if (!last.isNumber()) {
                sequence.pop(); // remove trailing operator
            }
            self.stringSequence(self.decode(sequence).join(' '));

            try  {
                var val = eval(self.stringSequence()) || 0;
                return val;
            } catch (e) {
                console.log('Error evaluating sequence "' + self.stringSequence() + '": ' + e);
            }
        });

        self.display = ko.computed(function () {
            return self.decode(self.code()).join(" ");
        });
    };

    var Population = function (goal, size) {
        var self = this;
        self.members = ko.observableArray();
        self.goal = ko.observable(goal);
        self.generationNumber = ko.observable(0);
        self.running = ko.observable(true);
        self.success = ko.observable(false);
        self.speed = ko.observable(20);
        self.input = ko.observable('123');
        while (size--) {
            var gene = new Gene();
            gene.generate(self.goal().length);
            self.members.push(gene);
        }

        self.sort = function (iterator) {
            self.members.sort(function (a, b) {
                return iterator(a) - iterator(b);
            });
        };
        self.generation = function () {
            for (var i = 0; i < self.members().length; i++) {
                self.members()[i].calcCost(self.goal());
            }
            self.sort(function (g) {
                return g.cost();
            });

            var children = self.members()[0].mate(self.members()[1]);
            self.members().splice(self.members().length - 2, 2, children[0], children[1]);

            for (var i = 0; i < self.members().length; i++) {
                self.members()[i].mutate(0.5);
                self.members()[i].calcCost(self.goal());
                if (self.members()[i].value() == self.goal()) {
                    self.success(true);
                }
            }
            if (self.success()) {
                self.sort(function (g) {
                    return g.cost();
                });
                return true;
            }
            self.generationNumber(self.generationNumber() + 1);
            self.sort(function (g) {
                return g.value();
            });
            if (self.running()) {
                setTimeout(function () {
                    self.generation();
                }, self.speed());
            }
        };

        self.setPopulation = function () {
            self.goal(self.input());

            self.generation();
        };
    };

    console.clear();

    var population = window.population= new Population('123', 20);

    ko.applyBindings(population);
});