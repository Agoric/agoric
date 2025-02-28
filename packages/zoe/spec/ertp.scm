(define-module (ertp)
  #:use-module ((rnrs base) #:select (assert)) ;; for assert
  #:use-module (goblins)
  #:use-module (goblins ghash)
  #:use-module (goblins actor-lib methods)
  #:use-module (goblins actor-lib selfish-spawn)
  #:use-module (store)
  #:use-module (endo)
  #:export (nat-value-math nat-amount-math makeIssuerKit)
  )

(define nat-value-math
  (let ((check1 (lambda (x) (assert (nat? x))))
	(check2 (lambda (x y)
		  (assert (nat? x))
		  (assert (nat? y)) ;; TODO: diagnostic to say which is bad
		  )))
    (methods
     [(coerce _b x)
      (check1 x)
      x]
     [(makeEmpty _b #:optional _ak) 0]
     [(isEmpty x)
      (check1 x)
      (eq? x 0)]
     [(isGTE x y)
      (check2 x y)
      (>= x y)]
     [(isEqual x y)
      (check2 x y)
      (= x y)]
     [(add x y)
      (check2 x y)
      (+ x y)]
     [(subtract x y)
      (check2 x y)
      (or (>= x y) (error (format #f "cannot subtract ~a from ~a" y x)))
      (- x y)]
     [(min x y)
      (check2 x y)
      (if (< x y) x y)]
     [(max x y)
      (check2 x y)
      (if (> x y) x y)]
     )))

(define helpers
  (%r
   "nat" nat-value-math))
(define (getHelpers assetKind)
  (define m (get helpers assetKind))
  (or m (error (format #f "no such asset kind: ~a" assetKind))))

(define BrandShape (M 'remotable "Brand"))
(define (getBrand allegedAmount)
  (mustMatch allegedAmount (M 'record))
  (define brand (get allegedAmount 'brand))
  (mustMatch brand BrandShape)
  brand)
(define (getCommonBrand left right)
  (define leftBrand (getBrand left))
  (define rightBrand (getBrand right))
  (if (eq? leftBrand rightBrand)
      leftBrand
      (error
       (format #f "Brands in left ~a and right ~a should match but do not"
	       left right
	       ))))
(define (with-common-brand left right op)
  (let ((brand (getCommonBrand left right))
	(x (get left 'value))
	(y (get right 'value)))
  (%r "brand" (getCommonBrand left right) "value" (op x y))))

(define (brand-lift m)
  (methods
   [(coerce brand allegedAmount)
    (mustMatch brand BrandShape)
    (mustMatch (getBrand allegedAmount) brand)
    (define value (m 'coerce #f (get allegedAmount 'value)))
    (%r "brand" brand "value" value)]
   [(makeEmpty brand #:optional (assetKind "nat"))
    (mustMatch brand BrandShape)
    (define value ((getHelpers assetKind) 'makeEmpty #f))
    (%r "brand" brand "value" value)]
   [(isEmpty allegedAmount)
    (getBrand allegedAmount)
    (m 'isEmpty (get allegedAmount 'value))]
   [(isGTE left right)
    (getCommonBrand left right)
    (m 'isGTE (get left 'value) (get right 'value))]
   [(isEqual left right)
    (getCommonBrand left right)
    (m 'isEqual (get left 'value) (get right 'value))]
   [(add left right)
    (with-common-brand left right (lambda (x y) (m 'add x y)))]
   [(subtract left right)
    (with-common-brand left right (lambda (x y) (m 'subtract x y)))]
   [(min left right)
    (with-common-brand left right (lambda (x y) (m 'min x y)))]
   [(max left right)
    (with-common-brand left right (lambda (x y) (m 'max x y)))]
   ))

(define nat-amount-math (brand-lift nat-value-math))

(define-actor (^payment _bcom brand)
  (methods
   [(getAllegedBrand) brand]))

(define-actor (^purse bcom self brand value amtMath ledger)
  (amtMath 'coerce value) ;; guard idiom?
  (methods
   [(getAllegedBrand) brand]
   [(getCurrentAmount) value] ;; TODO: value -> amount
   [(deposit pmt)
    (define pmt-value ($ ledger 'get pmt)) ;; throw if pmt not recognized
    ($ ledger 'delete pmt)
    (let ((updated (amtMath 'add value pmt-value)))
      (bcom (^purse bcom self brand updated amtMath ledger) pmt-value))
    ]
   [(withdraw amt)
    (assert (amtMath 'isGTE value amt))
    (define pmt (spawn ^payment brand))
    ($ ledger 'init pmt amt)
    (let ((updated (amtMath 'subtract value amt)))
      (bcom (^purse bcom self brand updated amtMath ledger) pmt))]
   ))

(define* (makeIssuerKit name #:optional (amtMath nat-amount-math))
  (define-actor (^brand _bcom)
    (methods
     [(is-my-issuer s) (eq? s issuer)]))
  (define brand (spawn ^brand))
  (define ledger (spawn ^weak-scalar-map-store))
  (define-actor (^issuer _bcom)
    (methods
     [(getBrand) brand]
     [(makeEmptyPurse)
      (define value (amtMath 'makeEmpty))
      (selfish-spawn ^purse brand value amtMath ledger)]))
  (define issuer (spawn ^issuer))
  (define-actor (^mint _bcom)
    (methods
     ((mint-payment amt)
      (amtMath 'coerce amt)
      (define pmt (spawn ^payment brand))
      ($ ledger 'init pmt amt)
      pmt)
     ((get-issuer) issuer)))
  (define mint (spawn ^mint))
  (%r 'mint mint 'issuer issuer 'brand brand))
