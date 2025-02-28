(define-module (endo) ;; TODO: endo nat
  #:use-module ((rnrs base) #:select (assert assertion-violation)) ;; assert
  #:use-module ((srfi srfi-1) #:select (every)) ;; lists
  #:use-module ((srfi srfi-9) #:select (define-record-type)) ;; records
  #:use-module ((srfi srfi-9 gnu) #:select (define-immutable-record-type));; immutable records
  #:use-module ((srfi srfi-43) #:select (vector? vector-every)) ;; vectors for copyArray
  #:use-module ((goblins) #:select (promise-refr? live-refr?))
  #:use-module ((goblins actor-lib methods) #:select (methods))
  #:export (nat?
	    passStyleOf isPassable
	    get %r
	    makeTagged getTag getPayload
	    M mustMatch))

;;;;
;; @endo/nat

(define (nat? x)
  (and (exact-integer? x) (>= x 0)))

;; Record stuff
(define (asKey x)
  (cond
   ((string? x) x)
   ((symbol? x) (symbol->string x))
   (else (error 'not-copyRecord-key x))))

(define (get r k) (assoc-ref r (asKey k))) ;; #f if no entry

(define (%r . rest)
  (if (eq? '() rest) '()
      (let ((k1 (car rest))
            (v1 (cadr rest))
            (more (cddr rest)))
        (let ((head (cons (asKey k1) v1))
              (tail (apply %r more)))
          (cons head tail)))))


(define (copy-record-entry? entry)
  (unless (pair? entry)
    (error 'bad-copy-record-entry entry))
  (let* ((key (car entry))
	 (value (cdr entry))
	 (ks (passStyleOf key))
	 (vs (passStyleOf value)))
    (eqv? ks "string"))) ;; or symbol, yes?

(define (copy-record? x)
  (and (list? x)
       (every copy-record-entry? x)))

;;;;
;; @endo/pass-style

(define-immutable-record-type <tagged>
  (_make-tagged tag payload)
  isTagged
  (tag getTag)
  (payload getPayload)
  )

(define (makeTagged tag payload)
  (unless (eqv? (passStyleOf tag) "string")
    (error 'tag-not-string tag))
  (passStyleOf payload) ;; or throw
  (_make-tagged tag payload))

(define* (passStyleOf x #:key [elseThrow #t])
  (cond
   ((unspecified? x) "undefined")
   ((null? x) "null")
   ((eq? x #t) "boolean")
   ((eq? x #f) "boolean")
   ((string? x) "string") ;; ASSUME not mutated.
   ((symbol? x) "symbol") ;; hmm.... treat symbols as strings?
   ;; ((endo-symbol? x) "symbol")
   ((exact-integer? x) "bigint")
   ((and (number? x) (inexact? x)) "number")
   ((promise-refr? x) "promise")
   ((live-refr? x) "remotable") ;; check _after_ promise-refr?
   ((exception? x) "error")
   ((isTagged x) "tagged")
   ((copy-array? x) "copyArray")
   ((copy-record? x) "copyRecord")
   (else
    (and elseThrow (throw 'not-passable "not passable" #:specimen x)))))

(define (assertTypeOf x expected)
  (define actual (passStyleOf x))
  (or (eqv? actual expected)
      (assertion-violation #f (format #f "expected ~a not ~a" expected actual) x)))

(define (isPassable x) (string? (passStyleOf x #:elseThrow #f)))

(define (copy-array? x)
  (and (vector? x) (vector-every isPassable x)))

;;;
(define (makeKindMatcher kind) (makeTagged "match:kind" kind))

(define RemotableShape (makeKindMatcher "remotable"))

(define* (makeMatcher tag #:optional payload)
  (makeTagged tag payload))

(define AnyShape (makeMatcher "match:any"))
(define RecordShape (makeTagged "match:recordOf" #(AnyShape AnyShape)))

(define M
  (methods
   [(any) AnyShape]
   [(record) ;; TODO: limits?
    RecordShape]
   [(remotable #:optional label)
    (if (unspecified? label)
	 RemotableShape
	 (makeMatcher "match:remotable" (%r "label" label))
	 )]
   ))

(define (kindOf specimen)
  (define passStyle (passStyleOf specimen))
  (cond
   ((not (equal? passStyle "tagged")) passStyle)
   (else
    (let ((tag (getTag specimen)))
      (assert (string? tag)) ;; redundant?
      tag))))

(define matchAnyHelper
  (methods
   [(checkMatches specimen _pattPayload _check)
    (and (passStyleOf specimen) ;; TODO: better diagnosic
	 #t)]
   ))

(define matchKindHelper
  (methods
   [(checkMatches specimen kind _check)
    (let ((passStyle (passStyleOf specimen)))
      (or (eqv? kind passStyle)
	  (error (format #f "~a ~a - Must be a ~a"
			 passStyle specimen kind))))]
    ))

(define matchRemotableHelper
  (methods
   [(checkMatches specimen remotableDesc _check)
    (let ((passStyle (passStyleOf specimen)))
      (or (eqv? "remotable" passStyle)
	  (let ((label (get remotableDesc 'label))
		(kindDetails
		 (if (equal? passStyle "tagged") (getTag specimen) passStyle)))
	    (error (format #f "~a - Must be a remotable (~a) not ~a"
			   specimen label kindDetails)))))]
   ))

(define matchRecordOfHelper
  (methods
   [(checkMatches specimen constraints _check)
    (let ((passStyle (passStyleOf specimen)))
      (or (equal? constraints #(AnyShape AnyShape))
	  (error "KeyShape / ValueShape TODO"))
      (or (eqv? "copyRecord" passStyle)
	  (error (format #f "~a - Must be a copyRecord not ~a"
			 specimen passStyle))))]
   ))

(define matchHelpers
  (%r
   "match:any" matchAnyHelper
   "match:recordOf" matchRecordOfHelper
   "match:remotable" matchRemotableHelper
   ))

(define (todo) (error "TODO"))

(define* (mustMatch specimen patt #:optional label)
  (define pattKind (kindOf patt))
  (cond
    [(equal? "remotable" pattKind)
     (or (eq? patt specimen) (error (format #f "~a must be ~a" specimen patt)))]
    [else
     (let ((helper (get matchHelpers pattKind)))
       (helper 'checkMatches specimen (getPayload patt) todo))]
    ))

