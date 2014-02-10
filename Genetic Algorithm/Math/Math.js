$(function() {
    var Gene = function(code) {
        if (code) this.code = code;
        this.cost = 9999;
    };
    Gene.prototype.code = '';
    
    Gene.prototype.mutate = function(chance) {
        

    };
    Gene.prototype.mate = function(gene) {
        var pivot = Math.round(this.code.length / 2) - 1;

    };
    Gene.prototype.calcCost = function(compareTo) {
        var total = 0;
        
    };
    var Population = function(goal, size) {
        this.members = [];
        this.goal = goal;
        this.generationNumber = 0;
        while (size--) {
            var gene = new Gene();
            gene.random(this.goal.length);
            this.members.push(gene);
        }
    };
    Population.prototype.display = function() {
        document.body.innerHTML = '';
        document.body.innerHTML += ("<h2>Generation: " + this.generationNumber + "</h2>");
        document.body.innerHTML += ("<ul>");
        for (var i = 0; i < this.members.length; i++) {
            document.body.innerHTML += ("<li>" + this.members[i].code + " (" + this.members[i].cost + ")");
        }
        document.body.innerHTML += ("</ul>");
    };
    Population.prototype.sort = function() {
        this.members.sort(function(a, b) {
            return a.cost - b.cost;
        });
    }
    Population.prototype.generation = function() {
        for (var i = 0; i < this.members.length; i++) {
            this.members[i].calcCost(this.goal);
        }

        this.sort();
        this.display();
        var children = this.members[0].mate(this.members[1]);
        this.members.splice(this.members.length - 2, 2, children[0], children[1]);

        for (var i = 0; i < this.members.length; i++) {
            this.members[i].mutate(0.9);
            this.members[i].calcCost(this.goal);
            if (this.members[i].code == this.goal) {
                this.sort();
                this.display();
                return true;
            }
        }
        this.generationNumber++;
        var scope = this;
        setTimeout(function() {
            scope.generation();
        }, 20);
    };


    var population = new Population("Dominate!", 20);
    population.generation();
});