;; https://github.com/Agoric/agoric-sdk/blob/master/packages/ERTP/test/unitTests/amountProperties.test.js
;; https://ngyro.com/software/guile-quickcheck.html
(use-modules (quickcheck)
             (quickcheck arbitrary)
             (quickcheck property)
             (quickcheck generator)
             (ice-9 match)
             (srfi srfi-26) ;; 26: Notation for Specializing Parameters without Currying
             (ertp)
	     ((endo) #:select (get %r))
	     ((goblins) #:select (spawn-vat with-vat))
             )

(define (ensure-equivalence m $gen)
  (property
   ((x $gen) (y $gen) (z $gen))
   (and
    (memq (m 'isEqual x y) '(#t #f))  ;; total
    (m 'isEqual x x) ;; Reflexive
    (if (m 'isEqual x y) (m 'isEqual y x) #t) ;; Symmetric
    (if (and (m 'isEqual x y) (m 'isEqual y z)) (m 'isEqual x z) #t) ;; Transitive
    )
   ))

(define* (partial-order m $gen brand) ;; isGTE is a partial order with empty as minimum
  (define empty (m 'makeEmpty brand))
  (property
   ((x $gen) (y $gen) (z $gen))
   (and
    (m 'isGTE x empty)
    ;; Total
    (memq (m 'isGTE x y) '(#t #f))
    ;; Reflexive
    (m 'isGTE x x)
    ;; Antisymmetric
    (if (and (m 'isGTE x y) (m 'isGTE y x)) (m 'isEqual x y) #t)
    )))

(define (add-ok m $gen brand) ;; closed, commutative, associative, monotonic, with empty identity
  (define empty (m 'makeEmpty brand))
  (property
   ((x $gen) (y $gen) (z $gen))
   (and
    ;; note: + for SET is not total.
    (m 'coerce brand (m 'add x y))
    ;; Identity (right)
    (m 'isEqual (m 'add x empty) x)
    ;; Identity (left)
    (m 'isEqual (m 'add empty x) x)
    ;; Commutative
    (m 'isEqual (m 'add x y) (m 'add y x))
    ;; Associative
    (m 'isEqual (m 'add (m 'add x y) z) (m 'add x (m 'add y z)))
    ;; Monotonic (left)
    (m 'isGTE (m 'add x y) x)
    ;; Monotonic (right)
    (m 'isGTE (m 'add x y) y)
    )
   ))

(define (subtract-ok m $gen) ;; (x + y) - y = x; (y - x) + x = y if y >= x'
  (property
   ((x $gen) (y $gen))
   (and
    (m 'isEqual (m 'subtract (m 'add x y) y) x)
    (if (m 'isGTE y x) (m 'isEqual (m 'add (m 'subtract y x) x) y) #t)
    )))

(define (minmax-ok m $gen)
  (property
   ((x $gen) (y $gen))
   (and
    (if (m 'isGTE x y)
        (m 'isEqual (m 'max x y) x)
        (m 'isEqual (m 'min x y) x))
    (if (and (not (m 'isGTE x y)) (not (m 'isGTE y x)))
        (and (eq?
	      (with-exception-handler (lambda (exc) 'incomparable) (m 'min x y))
	      'incomparable)
             (eq?
	      (with-exception-handler (lambda (exc) 'incomparable) (m 'max x y))
	      'incomparable))
	#t))))

(define* (check-amount-math m $gen brand)
  (quickcheck (ensure-equivalence m $gen))
  (quickcheck (partial-order m $gen brand))
  (quickcheck (add-ok m $gen brand))
  (quickcheck (subtract-ok m $gen))
  (quickcheck (minmax-ok m $gen))
  )

(define a-vat (spawn-vat))
(define aBrand
  (with-vat a-vat
	    (define anIssuerKit (makeIssuerKit "A"))
	    (get anIssuerKit 'brand)))

(define ($amountOf $value)
  (let ((v-gen (arbitrary-gen $value))
	(v-xform (arbitrary-xform $value)))
    (arbitrary
     (gen (generator-lift (lambda (value) (%r "brand" aBrand "value" value)) v-gen))
     (xform (lambda (p gen)
	      (v-xform (get p 'value) v-gen))))))

(check-amount-math nat-value-math $natural aBrand)
(check-amount-math nat-amount-math ($amountOf $natural) aBrand)
