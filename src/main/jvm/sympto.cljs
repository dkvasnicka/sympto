(ns cljsympto.core
  (:use [clojure.test :as t]
        [clojure.zip :as z]))

(defn ^:export detectInfertilePeriod
  "Detects infertile period based on credible temperature rise occurence.
  Returns the position of the first temp rise or -1 if none."
  [measurements]
  (let [startLoc
    ; find the first loc that has 6 preceding siblings
    (loop [ptr (clojure.zip/down (clojure.zip/seq-zip
                                   (map #(nth % 1) measurements)))]
      (if (nil? ptr)
        ; nothing found
        nil
        (if (= 6 (count (clojure.zip/lefts ptr)))
          ptr
          (recur (clojure.zip/right ptr)))))]

    ; check the left 6 numbers for each loc
    (loop [l startLoc]
      (if (nil? l)
        ; we are finished and found nothing
        -1

        ; continue searching...
        (if
          (let [lfts        (clojure.zip/lefts l)
                precSix     (take-last 6 lfts)
                precSixMax  (reduce max precSix)]
            (and
              ; 6 prec. s. are lower
              (every? true? (map #(< % (clojure.zip/node l)) precSix))
              ; the 2 right siblings are at least 0.2 higher than max(prec6)
              ; dirty hack to make Clojure float compat with ClojureScript
              (every? true? (map #(>= (- % precSixMax) 0.19999)
                              (let [rghts (take 2 (clojure.zip/rights l))]
                                (if (empty? rghts)
                                  '(-1)
                                  rghts))))))
          ; return the position...
          (count (clojure.zip/lefts l))
          ; ...or move right and check again
          (recur (clojure.zip/right l))))
      )))

; --------------- TESTS
;(deftest testDetectInfertilePeriod
;    (is (= 6 (detectInfertilePeriod
;               [[0 36.5] [0 36.3] [0 36.5] [0 36.4] [0 36.6] [0 36.5] [0 36.7] [0 36.8] [0 36.8]])))
;
;    (is (= 7 (detectInfertilePeriod
;               [[0 37] [0 36.5] [0 36.3] [0 36.5] [0 36.4] [0 36.6] [0 36.5] [0 36.7] [0 36.8] [0 36.8]])))
;
;    (is (= 7 (detectInfertilePeriod
;               [[0 37] [0 36.5] [0 36.3] [0 36.5] [0 36.4] [0 36.6] [0 36.5] [0 36.7] [0 36.6] [0 36.8]])))
;
;    (is (= -1 (detectInfertilePeriod
;              [[0 35] [0 36]]))))
;
;
;(run-tests 'cljsympto.core)