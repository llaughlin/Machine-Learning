/// <reference path="jquery-2.1.0.min.js" />
/// <reference path="underscore-min.js" />
/// <reference path="knockout-3.0.0.js" />

$(function () {
    Math.baseLog = function(base, x) {
        return Math.log(x) / Math.log(base);
    };

    String.prototype.toHex = function() {
        return parseInt(this, 16);
    };
    String.prototype.isNumber = function() {
        return this.toHex() < 10;
    };
    Number.prototype.toHex = function(){
        return this.toString(16);
    };

    var Gene = function (code) {
        var self = this;
        self.code = ko.observable(code || '');
        self.cost = ko.observable(9999);

        self.generate = function(length) {
             while(length--){
                 self.code(self.code() + Math.floor(Math.random()*13).toHex());
            }
        };
        self.mutate = function(chance) {
            if (Math.random() > chance) return;
                
            var index = Math.floor(Math.random() * self.code().length);
            var upOrDown = Math.random() <= 0.5 ? -1 : 1;
            var distance = 1;//Math.floor(Math.random() * Math.baseLog(20, self.cost()) + 1);
            //if (self.cost() < 10) {
            //    distance = 1;
            //}

            var newChar = ((self.code()[index].toHex() + distance * upOrDown) % 13).toHex();
            var newString = '';
            for (i = 0; i < self.code().length; i++) {
                if (i == index) newString += newChar;
                else newString += self.code()[i];
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
            var value = self.value(),
            cost = parseInt(compareTo) - value;
            self.cost(cost);
        };
        self.decode = function (code) {
            return _.map(code, function (c) {
                switch (c.toHex()) {
                    case 10:
                        return '+';
                        break;
                    case 11:
                        return '-';
                        break;
                    case 12:
                        return '*';
                        break;
                    case 13:
                        return '/';
                        break;
                    default:
                        return c;
                }
            });
        };
        self.value = ko.computed(function(){
            var sequence = [],
            last = '';
            _.each(self.code(), function(next){
                if(last.isNumber()){
                   if(!next.isNumber()){
                       sequence.push(next);
                       last = next;
                   }
                }else{
                    if(next.isNumber()){
                        sequence.push(next);
                        last = next;
                    }
                }
            });
            if(!last.isNumber()){
                sequence.pop(); // remove trailing operator
            }
            var stringSequence = self.decode(sequence).join(' ');
            //console.log('Eval(' + sequence + ')');
            
            try{
                var val = eval(stringSequence);
            return val;
            }catch(e){
                console.log('Error evaluating sequence "' + stringSequence + '": ' + e);
            }
            
        });
       
        self.display = ko.computed(function() {
            return self.decode(self.code()).join(" ");
        });
    };


    var Population = function (goal, size) {
        var self = this;
        self.members = ko.observableArray();
        self.goal = ko.observable(goal);
        self.generationNumber = ko.observable(0);
        while (size--) {
            var gene = new Gene();
            gene.generate(self.goal().length);
            self.members.push(gene);
        }

        self.sort = function () {
            self.members.sort(function (a, b) {
                return a.cost() - b.cost();
            });
        };
        self.generation = function () {
            for (var i = 0; i < self.members().length; i++) {
                self.members()[i].calcCost(self.goal());
            }

            self.sort();
            var children = self.members()[0].mate(self.members()[1]);
            self.members().splice(self.members().length - 2, 2, children[0], children[1]);

            for (var i = 0; i < self.members().length; i++) {
                self.members()[i].mutate(0.5);
                this.members()[i].calcCost(this.goal());
                if (self.members()[i].code() == self.goal()) {
                    self.sort();
                    return true;
                }
            }
            self.generationNumber(self.generationNumber() + 1);
            setTimeout(function () {
                //self.generation();
            }, 50);
        };
    };

    console.clear();

    population = new Population("999", 20);

    ko.applyBindings(population);

    population.generation();
});