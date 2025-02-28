;; rockit copyrecord syntax https://github.com/cwebber/rockit
;; %r
;; (add-to-load-path (dirname (current-filename)))

(use-modules (goblins) ;; <-
             (goblins actor-lib joiners)
             (goblins ghash)
             (srfi srfi-64) ;; test
             (endo) ;; (add-to-load-path (getcwd))
             (ertp)
             (escrow2013)
             )

;; see also ggspec
;; https://stackoverflow.com/questions/72057/how-to-build-unit-tests-in-guile-which-output-to-the-tap-standard
(test-begin "alice")

(test-assert (procedure? spawn-promise-values))
(test-assert (procedure? makeIssuerKit))

(test-equal (nat? 0) #t)
(test-equal (nat? -1) #f)

(define rec1 (%r 'x 1 'y 2))
(test-equal 1 (get rec1 'x))

(define a-vat (spawn-vat))

(with-vat
 a-vat

 (peek "in vat a" a-vat)

 (define money (makeIssuerKit 'money))
 (test-equal (map car money) '(mint issuer brand))

 (define stock (makeIssuerKit 'stock))

 (define the-issuers
      (%r
       'money (get money 'issuer)
       'stock (get stock 'issuer))
      )

 (define (alice purse1)
   (let* ((cancel #f)
          (a (%r
              'moneySrcP purse1
              'stockDstP (<- (get stock 'issuer) 'makeEmptyPurse)
              'stockNeeded 7
              'cancellationP ((lambda ()
                                (define-values (p r) (spawn-promise-values))
                                (set! cancel r)
                                (peek "@@cxl" cancel)
                                p))
              )) )
     (peek "alice:" a)
     a
     ))

  (define (bob purse2)
   
   (let* ((cancel #f)
          (b (%r
              'stockSrcP purse2
              'moneyDstP (<- (get stock 'issuer) 'makeEmptyPurse)
              'moneyNeeded 5
              'cancellationP ((lambda ()
                                (define-values (p r) (spawn-promise-values))
                                (set! cancel r)
                                (peek "@@cxl b" cancel)
                                p))
              )) )
     (peek "bob:" b)
     b))

 (define purse1 ($ (get money 'issuer) 'makeEmptyPurse))
 (test-equal 0 ($ purse1 'getCurrentAmount))
 
 (define pmt1 ($ (get money 'mint) 'mint-payment 20))
 ($ purse1 'deposit pmt1)
 (test-equal 20 ($ purse1 'getCurrentAmount))

 (define purse2 ($ (get stock 'issuer) 'makeEmptyPurse))
 (define pmt2 ($ (get stock 'mint) 'mint-payment 20))
 ($ purse2 'deposit pmt2)

 (let ((d (escrowExchange (alice purse1)
                          (bob purse2)
                          (get money 'issuer)
                          (get stock 'issuer))))
   (on (peek "escExch d" d) (lambda (dd)
           (peek "decision" dd)
           (test-equal '(5 7) dd)))
   )
 )

(test-end "alice")
