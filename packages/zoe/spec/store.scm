(define-module (store)
  #:use-module (rnrs base)
  #:use-module (goblins)
  #:use-module (goblins actor-lib methods)
  #:export (^weak-scalar-map-store)
  )

(define-actor (^weak-scalar-map-store _bcom)
  (define wm (make-weak-key-hash-table))
  (define fresh (list))
  (define (has k) (not (eq? (hashq-ref wm k fresh) fresh)))
  (methods
   [(has k) (has k)]
   [(init k v)
    (assert (not (has k)))
    (hashq-set! wm k v)]
   [(get k)
    (assert (has k))
    (hashq-ref wm k)]
   [(set k v)
    (assert (has k))
    (hashq-set! wm k v)]
   [(delete k)
    (assert (has k))
    (hashq-remove! wm k)]
   ))
