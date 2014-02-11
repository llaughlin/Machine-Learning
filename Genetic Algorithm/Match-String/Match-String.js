$(function() {
    Math.baseLog = function(base, x) {
        return Math.log(x) / Math.log(base);
    }

    var Gene = function(code) {
        var self = this;
        self.code = ko.observable(code || '');
        self.cost = ko.observable(9999);

        self.random = function (length) {
            while (length--) {
                self.code(self.code() + String.fromCharCode(Math.floor(Math.random() * 255)));
            }
        };
        self.mutate = function(chance) {
            if (Math.random() > chance) return;

            var index = Math.floor(Math.random() * self.code().length);
            var upOrDown = Math.random() <= 0.5 ? -1 : 1;
            var distance = Math.floor(Math.random() * Math.baseLog(20, self.cost()) + 1);
            if(self.cost() < 10){
                distance = 1;
            }
            
            var newChar = String.fromCharCode(self.code().charCodeAt(index) + distance * upOrDown);
            var newString = '';
            for (i = 0; i < self.code().length; i++) {
                if (i == index) newString += newChar;
                else newString += self.code()[i];
            }

            self.code(newString);

        }
        self.mate = function(gene) {
            var pivot = Math.round(self.code().length / 2) - 1;

            var child1 = self.code().substr(0, pivot) + gene.code().substr(pivot);
            var child2 = gene.code().substr(0, pivot) + self.code().substr(pivot);

            return [new Gene(child1), new Gene(child2)];
        }
        self.calcCost = function(compareTo) {
            var total = 0;
            for (i = 0; i < self.code().length; i++) {
                total += Math.pow(self.code().charCodeAt(i) - compareTo.charCodeAt(i), 2) * Math.pow(self.code().charCodeAt(i) - compareTo.charCodeAt(i), 2);
            }
            self.cost(total);
        }
    };


    var Population = function(goal, size) {
        var self = this;
        self.members = ko.observableArray();
        self.goal = ko.observable(goal);
        self.generationNumber = ko.observable(0);
        while (size--) {
            var gene = new Gene();
            gene.random(self.goal().length);
            self.members.push(gene);
        }

        self.sort = function() {
            self.members.sort(function(a, b) {
                return a.cost() - b.cost();
            });
        }
        self.generation = function() {
            for (var i = 0; i < self.members().length; i++) {
                self.members()[i].calcCost(self.goal());

            }

            self.sort();
            var children = self.members()[0].mate(self.members()[1]);
            self.members.splice(self.members.length - 2, 2, children[0], children[1]);

            for (var i = 0; i < self.members().length; i++) {
                self.members()[i].mutate(0.5);
                this.members()[i].calcCost(this.goal());
                if (self.members()[i].code() == self.goal()) {
                    self.sort();

                    return true;
                }
            }
            self.generationNumber(self.generationNumber()+1);
            setTimeout(function() {
                self.generation();
            }, 5);
        };
    };

    console.clear();

    var population = new Population("1234567890 1234567890", 20);

    ko.applyBindings(population);

    population.generation();
});