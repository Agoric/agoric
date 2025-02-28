;; cf https://gitlab.com/spritely/guile-goblins/-/blob/main/goblins/actor-lib/joiners.scm?ref_type=heads
;; 203d710a8af13af2b894a9bac711df8e800af708

(define-module (race)
  #:use-module (goblins)
  #:export (race))

(define (race . promises)
  "Return a promise which resolves when the first promise in @var{promises}
settles.  If that promise is broken then so is the returned promise.

Type: Promise ... -> Promise"
  (define-values (race-promise race-resolver)
    (spawn-promise-values))
  (for-each (lambda (promise)
              (on promise
                  (lambda (result)
                    (<-np race-resolver 'fulfill result))
                  #:catch
                  (lambda (err)
                    (<-np race-resolver 'break err))))
            promises)
  race-promise)
