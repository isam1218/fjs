describe("inheritance", function() {
    it("single inheritance", function() {
        var A = function(f) {
            this.f = f;
        };
        A.prototype.getF = function() {
            return this.f;
        };
        A.prototype.get0 = function() {
            return 0;
        }

        var B = function(f) {
            A.call(this, f);
            this.f2 = 2;
        };
        B.extend(A);
        B.prototype.getF2 = function() {
          return this.f2;
        };
        B.prototype.get0 = function()  {
            return null;
        }
        expect(1).toBe(new B(1).getF());
        expect('2').toBe(new B('2').getF());
        expect(true).toBe(new B(3) instanceof A);
        expect(true).toBe(new B() instanceof B);
        expect(3).toBe(new B(3).f);
        expect(2).toBe(new B(1).getF2());
        expect(2).toBe(new B(1).f2);
        expect(0).toBe(new A(1).get0());
        expect(null).toBe(new B(1).get0());
    });
    it("multiple inheritance", function() {
        var A = function(f) {
            this.f = f;
        };
        A.prototype.getF = function() {
            return this.f;
        };
        A.prototype.get0 = function() {
            return 0;
        }

        var B = function(f2) {
            this.f2 = f2;
        };
        B.prototype.getF2 = function() {
            return this.f2;
        };
        B.prototype.get1 = function()  {
            return 1;
        };

        var C = function (f, f2) {
            A.call(this, f);
            B.call(this, f2);
        }
        C.extend(A, B);

        C.prototype.get0 = function() {
            return null;
        };

        C.prototype.get1 = function() {
            return 'one';
        }
        expect(1).toBe(new C(1, 2).getF());
        expect('2').toBe(new C(1, '2').getF2());
        expect(true).toBe(new C(3, 5) instanceof A);
        expect('one').toBe(new C().get1());
        expect(1).toBe(new B().get1());
        expect(1).toBe(new A(1).getF());
        expect(2).toBe(new C(1,2).f2);
        expect(0).toBe(new A(1).get0());
        expect(null).toBe(new C().get0());
    });

    it("multiple inheritance2", function() {
        var A = function(f) {
            this.f = f;
        };
        A.prototype.getF = function() {
            return this.f;
        };
        A.prototype.get0 = function() {
            return 0;
        };
        var B = function(f2) {
            A.call(this, f2)
            this.f2 = f2;
        };
        B.extend(A);
        B.prototype.getF2 = function() {
            return this.f2;
        };
        B.prototype.get1 = function()  {
            return 1;
        };

        var C = function(f) {
            B.call(this, f);
        }
        C.extend(B);
        expect(1).toBe(new C(1).getF());
        expect('2').toBe(new C('2').getF2());
        expect(0).toBe(new C(1).get0());
        expect(1).toBe(new C(1).get1());
    });
});