// namako.js
// toki pona pi ilo sona namako.
//
// A toki pona inspired interperted language.

const NAMAKO = (C) => {
    let cc, c, q, r, a, op, z, V, L,
        v = (x)=>({
            "ala": 0,
            "wan": 1,
            "tu": 2,
            "luka": 5,
            "mute": 10,
            "linja": 13,
            "ale": 100,
            "nasa": (Math.random()*256)|0
        }[x]),
        e = 0,
        l = 0,
        M = [];
    C=(cc = C == V ? 0 : C).call!=V?cc:cc.pop==V?(()=>(cc|0n)):()=>cc.shift();
    const la = "la",
        li = "li",
        m=(d,r)=>d.match(r),
        d=(d)=>m(d,/^[A-Z][a-zA-Z]*/),
        h=(s,r)=>s.split(r),
        w = (X) => typeof X != 'number' && (v[X] != V || d(X) != V),
        B = (b) => (X) => {
            throw Error(`${b} ike: ${X} (linja ${--l-1})`)
        },
        E = B("nimi"),
        R = (r) => B("pali")(r),
        Q = (q, r) => (q == r || B(q)(r)),
        W = (X) => w(X) || E(X),
        P = (n, f) => ((...A) => (A.length == n || R(...A)) && f(A[0])),
        p = (f) => P(1, f),
        G = (a) => (r = parseInt(a)) == NaN ? E() : r,
        F = (a) => (w(a) ? v[a] : G(a)),
        f = (a) => ((A = h(a,/\s+/)).length == 2 ? ((op = o[A[1]]) ? op(A[0]) : R(A[1])) : F(a)) | 0n,
        s = (a) => [h(a,/#|\s+(?!ala|ni)(?=(?:[^"]*"[^"]*")*[^"]*$)/g).map((x)=>L=h(x,'"').length-1?(x[ll=x.length-1]==x[0]&&x[0]=='"'?h(x.substr(1,ll-1),'').map((x)=>""+x.charCodeAt()):B("linja")(`'${x}'"`)):(m(x,/\s+ala$/) != V && !d(x) ? h(x, /\s+(?!ni)/) : [x]))].flat(2),
        O = (f, i, op, e, a, ...A) => Q("e", e) ? A.filter((x, i) => i % 2 || !(x == "en" || B("en")(x))).map(f).reduce(i[op] || R(op), f(a)) : 0,
        u = (...A) => ((a = A.length) > 3 ? O(f,i,...A)|0n : [
            f, (a, op) => (o[op] || R(op))(f(a)),
            (a, op, b) => (i[op] || R(op))(f(a), f(b)),
        ][a - 1](...A)) | 0n,
        U = (r, ...p) => (I[r] || R(r))(...p),
        o = {
            "ala": (a) => !F(a),
            "ni": (ma) => Q("ma", ma) ? l - 1 : 0
        },
        i = {
            "anu": (a, b) => (a | b),
            "en": (a, b) => a + b,
            "mute": (a, b) => a * b,
            "ante": (a, b) => a - b,
            "weka": (a, b) => a / b,
            "kipisi": (a, b) => Math.log(a) / Math.log(b),
            li: (a, b) => a == b
        },
        I = {
            "ken": (...L) => u(...L.splice((0), L.indexOf(la))) && L.shift() == la && U(...L),
            "ijo": (X, L, ...Y) => W(X) && (L == li || E(li)) && (v[X] = u(...Y)),
            "ma": p((ma) => W(ma) && (v[ma] = l-1)),
            "tawa": (...A) => (l = u(...A)),
            "o": (op, e, ...X) => M = Q("e", e) && M.concat(X.map({
                "toki": (x) => String.fromCharCode(f(x)),
                "nanpa": f,
                "pana": (x) => W(x) && (v[x] = C(...[].concat(M).reverse()))?V:V,
            } [op] || B("o")).filter((c)=>c!=V)),
            "pini": P(0, () => (e = 1)),
            "": () => {}
        };
    let A = async (S) => {
        e=0, S=S.call!=V?S:[c=h("\n"+S,/\n/),(i, N)=>N((q=c[i])==V?"pini":q)][1];
        while (!e) await S(l++, (T)=>U(...s(T.trim())), M);
        return M;
    }
    A.token = s
    A.evaluate = (X)=>s(X).map(f)
    A.expression = (X)=>u(...s(X))
    A.tawa = (X)=>(l=X)
    return A
}


module.exports = NAMAKO;
