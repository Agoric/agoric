(module
 (
  (import (importBind ((as "E" "E"))) "@endo/far")
  (const
   ((bind (def "Q") (use "Promise"))))
  (const
   ((bind
     (def "Qjoin")
     (call
      (use "harden")
      ((lambda ((def "p1") (def "p2"))
         (call (get (call (get (use "Q") "all")
                          ((array ((use "p1") (use "p2")))))
                    "then")
               ((arrow
                 ((matchArray ((def "r1") (def "r2"))))
                 (block
                  (
                   (if (pre:! (call (get (use "Object") "is")
                                    ((use "r1") (use "r2"))))
                       (block
                        (
                         (throw (call (use "Error")
                                      ((data "join failed")))))))
                   (return (use "r1")))))))))))))
  (const
   ((bind
     (def "transfer")
     (call
      (use "harden")
      ((arrow
        ((def "decisionP") (def "srcPurseP") (def "dstPurseP")
         (def "amount"))
        (block
         (
          (const
           ((bind
             (def "makeEscrowPurseP")
             (call (use "Qjoin")
                   ((get (call (get (use "E") "get") ((use "srcPurseP")))
                         "makePurse")
                    (get (call (get (use "E") "get") ((use "dstPurseP")))
                         "makePurse"))))))
          (const
           ((bind
             (def "escrowPurseP")
             (call (call (use "E") ((use "makeEscrowPurseP"))) ()))))
          (call (get (call (use "Q") ((use "decisionP"))) "then")
                ((arrow
                  ((def "_"))
                  (block
                   ((call (get (call (use "E") ((use "dstPurseP"))) "deposit")
                          ((use "amount")
                           (use "escrowPurseP"))))))
                 (arrow
                  ((def "_"))
                  (block
                   ((call (get (call (use "E") ((use "srcPurseP"))) "deposit")
                          ((use "amount")
                           (use "escrowPurseP"))))))))
          (return
           (call (get (call (use "E") ((use "escrowPurseP"))) "deposit")
                 ((use "amount") (use "srcPurseP"))))))))))))
  (const
   ((bind
     (def "failOnly")
     (call
      (use "harden")
      ((lambda ((def "cancellationP"))
         (call (get (call (use "Q") ((use "cancellationP"))) "then")
               ((arrow
                 ((def "cancellation"))
                 (block ((throw (use "cancellation")))))))))))))
  (const
   ((bind
     (def "escrowExchange")
     (call
      (use "harden")
      ((arrow
        ((def "a") (def "b"))
        (block
         ((let ((def "decide")))
          (const
           ((bind
             (def "decisionP")
             (call (get (use "Q") "promise")
                   ((arrow
                     ((def "resolve"))
                     (block
                      ((= (use "decide") (use "resolve"))))))))))
          (call
           (use "decide")
           ((call (get (use "Q") "race")
                  ((array
                    ((call
                      (get (use "Q") "all")
                      ((array ((call
                                (use "transfer")
                                ((use "decisionP")
                                 (get (use "a") "moneySrcP")
                                 (get (use "b") "moneyDstP")
                                 (get (use "b") "moneyNeeded")))
                               (call
                                (use "transfer")
                                ((use "decisionP")
                                 (get (use "b") "stockSrcP")
                                 (get (use "a") "stockDstP")
                                 (get (use "a") "stockNeeded")))))))
                     (call (use "failOnly") ((get (use "a") "cancellationP")))
                     (call (use "failOnly") ((get (use "b") "cancellationP"))))
                    )))))
          (return (use "decisionP"))))))))))))

;;;;;;;;;;;;
;; (use "id") -> id
;; (importBind ((as "E" "E"))) -> (E)
;; (const ((bind (def "id") RHS))) -> (defconst id = RHS)
;; (lambda ((def "p1") (def "p2")) -> (lambda (p1 p2)
;; (call x ...) -> (x ...)
;;  oops: should be:
;;    (call x (a b c)) (x a b c)
;; (array (x y)) -> [x y]
;; (arrow ((matchArray ((def "r1") (def "r2")))) ...) -> (arrow ([r1 r2]) ...)
;; (arrow ((def "a1") (def "a2")) ...) -> (arrow (a1 a2) ...)
;; (arrow ...) -> (lambda ) ???
;; (block (stmts...)) -> stmts...
;; (call (get O "p") args...) -> (callm O .p args...)
;; (get O "p") -> (:get O .p)
;; (data LIT) -> LIT
;; (pre:! X) -> (not X)

(module
 ((import (E) "@endo/far")
  (defconst Q = Promise)
  (defconst Qjoin =
    (harden
     (lambda (p1 p2)
       (callm (callm Q .all [p1 p2]) .then
              (=> ([r1 r2])
                  (if (not (callm Object .is r1 r2))
                      (throw (Error "join failed")))
                  (return r1))))))
  (defconst transfer =
    (harden
     (lambda (decisionP srcPurseP dstPurseP amount)
       (defconst makeEscrowPurseP =
         (Qjoin (:get (callm E .get srcPurseP) .makePurse)
                (:get (callm E .get dstPurseP) .makePurse)))
     ;; v- runtime bound function prolly doesn't work with apply$
       (defconst escrowPurseP = ((E makeEscrowPurseP) ))
       (callm (Q (decisionP)) .then
              (=> (_) (callm (E dstPurseP) .deposit amount escrowPurseP))
              (=> (_) (callm (E srcPurseP) .deposit amount escrowPurseP)))
       (return (callm (E escrowPurseP) .deposit amount srcPurseP)))))
  (defconst failOnly =
    (harden
     (lambda (cancellationP)
       (callm (Q cancellationP) .then
              (=> (cancellation) (throw cancellation))))))
  (defconst escrowExchange =
    (harden
     (lambda (a b)
       (let (decide))
       (defconst decisionP =
         (callm Q .promise
                (=> (resolve) (= decide resolve))))
       (decide ;; <- runtime bound function prolly doesn't work with apply$
        ((callm Q .race
                [(callm Q .all
                        [(transfer decisionP (:get a .moneySrcP)
                                   (:get b .moneyDstP) (:get b .moneyNeeded))
                         (transfer decisionP (:get b .stockSrcP)
                                   (:get a .stockDstP) (:get a .stockNeeded))])
                 (failOnly (:get a .cancellationP))
                 (failOnly (:get b .cancellationP)) ])))
       (return decisionP))))))
