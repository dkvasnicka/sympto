(ns sympto.core
  (:use [clojure.test :as t]
        [clojure.zip :as z]))

(defn ^:export detectInfertilePeriod
  "Detects infertile period based on credible temperature rise occurence"
  [measurements]
  (let [startLoc
    ; find the first loc that has 6 preceding siblings
    (loop [ptr (down (vector-zip measurements))]
      (if (= 6 (count (lefts ptr)))
        ptr
        (recur (right ptr))))]

    ; check the left 6 numbers for each loc
    (loop [l startLoc]
      (if (nil? l)
        ; we are finished and found nothing
        -1

        ; continue searching...
        (if
          (let [lfts (lefts l)
                precSix (nthrest lfts (- (count lfts) 6))
                precSixMax (reduce max precSix)]
            (and
              ; 6 prec. s. are lower
              (every? true? (map #(< % (node l)) precSix))
              ; the 2 right siblings are at least 0.2 higher than max(prec6)
              (every? true? (map #(>= (- (bigdec %) (bigdec precSixMax)) 0.2)
                              (take 2 (rights l))))))
          ; return the position...
          (count (lefts l))
          ; ...or move right and check again
          (recur (right l))))
      )))

; --------------- TESTS
(deftest testDetectInfertilePeriod
    (is (= 6 (detectInfertilePeriod
               [36.5 36.3 36.5 36.4 36.6 36.5 36.7 36.8 36.8])))

    (is (= 7 (detectInfertilePeriod
               [37 36.5 36.3 36.5 36.4 36.6 36.5 36.7 36.8 36.8])))

    (is (= -1 (detectInfertilePeriod
              [37 36.5 36.3 36.5 36.4 36.6 36.5 32.7 31.8 35.8]))))


(run-tests 'sympto.core)