(define-module (escrow2013)
  #:use-module (goblins) ;; <- spawn-promise-values
  #:use-module (goblins actor-lib joiners) ; all
  #:use-module (race)
  #:use-module (endo)
  #:use-module (ertp)
  #:export (escrowExchange)
  )

(define (transfer decisionP issuer srcPurseP dstPurseP amount)
  (peek "@@transfer:" decisionP issuer amount)
  ;; TODO: check srcPurseP and dstPurseP come from the same issuer
  (define escrowPurseP (<- issuer 'makeEmptyPurse))

  ;; setup phase 2
  (on decisionP
      (lambda (_y)
        (on (<- escrowPurseP 'withdraw amount)
            (lambda (pmt)
              (<- dstPurseP 'deposit pmt))))
      #:catch
      (lambda (_n)
        (on (<- escrowPurseP 'withdraw amount)
            (lambda (pmt)
              (<- srcPurseP 'deposit pmt)))))

  ;; phase 1
  (on (<- srcPurseP 'withdraw amount)
      (lambda (pmt)
        (<- escrowPurseP 'deposit pmt))
      #:promise? #t)
)

(define (failOnly cancellationP)
  (on cancellationP (lambda (cancellation) (error cancellation)) #:promise? #t))

;; a from Alice, b from Bob
(define (escrowExchange a b moneyIssuer stockIssuer)
  (define-values (decisionP decide) (spawn-promise-values))

  ($ decide 'fulfill
   (race
    (all-of
     (peek "txfr" (transfer decisionP moneyIssuer
                            (get a 'moneySrcP) (get b 'moneyDstP) (get b 'moneyNeeded)))
     (peek "tx2" (transfer decisionP stockIssuer
                           (get b 'stockSrcP) (get a 'stockDstP) (get a 'stockNeeded)))
     )
    (failOnly (get a 'cancellationP))
    (failOnly (get b 'cancellationP))
    )
   )
  decisionP
  )
