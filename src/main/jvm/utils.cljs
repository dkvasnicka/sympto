(ns utils)

(defn ^:export getMeasurementsInFlotFormat
    "Converts cycle JsonML to array suitable for Flot"
    [cycle]
    (jsArr (sort-by first
        (map #(let [attrs (nth % 1)]
                  (vector (.getTime (js/Date. (.date attrs)) nil) (js/parseFloat (.temp attrs))))
            (nnext cycle)))))

(defn ^:export jsArr
    "Recursively converts a sequential object into a JavaScript array"
    [seq]
    (.array (vec (map #(if (sequential? %) (jsArr %) %)
                     seq))))