import React, { useState } from 'react';

export default function CampusRecommendationHub() {
  const [activity, setActivity] = useState('study');
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Simulating active telemetry tracking near the admin core[cite: 1]
  const currentStudentGPS = {
    lat: 10.9364,
    lng: 76.7353
  };

  // Helper function to assign realistic image layers based on the campus venue[cite: 1]
  const getImageForSpot = (name) => {
    if (name.includes("Library")) {
      return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQctKCRvz03TQ7S6esYak80VuvzLHzN5wXfag&s"; // Academic Library
    }
    if (name.includes("Study Halls")) {
      return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS-lCB2O7ST4koWGYEcAGzdSp3R-eGpCDCGag&s"; // Campus Greenery
    }
    if (name.includes("Auditorium")) {
      return "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBxMTEhUSExMWFRUXGB4bGBgYGR0gIBgbHh8dHhodHRgaHSggGx0lHR0XITEiJSkrLi8uFx8zODMtNygtLisBCgoKDg0OGxAQGzUlICUtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLf/AABEIALcBEwMBIgACEQEDEQH/xAAcAAACAgMBAQAAAAAAAAAAAAAFBgMEAAIHAQj/xABHEAABAwIDBAcECAMGBAcAAAABAgMRACEEEjEFBkFREyIyYXGBkaGxwdEUI0JSYnKC8Acz4RUWkrLS8URTosIkNENjc4Oz/8QAGQEAAwEBAQAAAAAAAAAAAAAAAAECAwQF/8QALBEAAgIBBAIABAUFAAAAAAAAAAECESEDEjFBE1EEImGRcYGhscEUMkLh8P/aAAwDAQACEQMRAD8A4k8DJqdsAgGDPxrXCJSSoLIBg68/ga2wjuUkH9+dQ+BMmEpTOh4Ry8OHnrIr0GRp+/61IpYgyTcW+Xu9Krtix+WnOo5JN8RBREGRPhzEVOwhQSAJjhAJ58PETUK1BI7+4/v9miGBeUOzNj1SIkA3NjUyfyh0QYUE8erxPzm4qVhsKyEp6pSSe/SfObedGEYBKwVjUCVQQSZBJ6o754WEVW2EFLskJJSgQk2mBmVB07yO6s975QEWycjL6B1g2u6STGVfIEjQiBxMHmKv4vZqwVZsouAUhUkJNza55TxsbVee2a482pswCQkhGZIzBJiUk2ka68TbnQwmIXkcYJHTpUEWP8wKkAxook5J7k+NbK3G2Av7KR9apAJiY4c4mDraaO9C422stEraKU9MCLIXa6VHjABBF0gieBoLtVpTOIyqzIUICgIkR1Vd0wPC9dF3MxeEagPoVlVZClJJuSO0SdREzGnjFO/Y2LeLxTRw68pUkoAQk8lQCRHICT4xTduXs55DYbDALhCVh1USi0ATcc7Rr4Uobw4BLT/1Kj9HcOYT95Mgiw4ZlAeNMStpudOAAomY+qAGnVSCqRfQkmPOiMUnQAvBFWExuIY6MuuKUpLQIMFRMpWUzcBJUdY8KpbyYTo+iQkAdULWoXJWZMqVEzFv0zaju8O032sRh9pBEZFFpOYTnCZBUVaKJkpMcu8CoNhbOf2i6paUEtIVJEjUm2ZRgHiYHI2olFvgYrt4dWIxTSSJlKRe9hJ46mP2KM72BpGEbQ0JWVZlKB+wR2VDUEGPI1JtBlWCxRU6M6mzbhMp6losDOncaH7H2W5jFqUZhS0lxVtCqB4E5gBw05Gsl9egGPcDdRwsnGEgKIUlhKoEmO0J4gi3goxpRQ7UCilKnEhtsdVUkXF7QBYWTEW1pvwL7CUsMYjIkJCQ0kKJBMEaTdPCbjvoFtrdloPLHRhpANlgSAuRlGUAkmM0DvHI1rKL/wARMD717Yw+IQEvNyQSekSmCT93OBqARJ7tDQHYxecUG2HXDJjKqFW0k8YA8x7aI47d9LriUpWtKGyrM4s2ypgAhKjYlXDv9WLdDY+GaRmW62VEEtmYUmBfrpiZOY8Y4HWsvHJv5mAI2vtB/CpDC2WEqQbrSoq6RKiZ4SnjY39BQXeDapeSFKeztq+yFHMDPWyggdkWBsDeO7zebDr6cgpVm7SiSSPvT5jKTbWTUuLxf0roW1ZQnIEwEwqwKc0gXHaMT9lPCwTlTefyHZV2FvCvDgpZMJkcpn1Pf60fxm8DmKSQlaZMGCOq3EyAcpJKurfu4aAfjtiYcHJhlKWnmYAk6GReB8JqPH7NVITlh0JGYAG50VI1CtDA586zWs1dAi9sretYUUuNtiD1SEhJQq8FIA71f4jV3Z28j6ypOVTgynMgCbHRyVcNe+w8aH4DAq6NZUlsZrERmUVAkCEgcQVX8OYqfC7QewwDzisokpSiwzZeAAvbQ8DPjGsNV1kB/QW2mgrJlECyRPhpqKFOb1MBKlALUU6gJmPEiwpR3m3iOI6NTKpNk9EoApBgyTwVewtxN6BbDbxa23GkFRbuVROUZAFacQbC3dXQpp8BY2bfwasYyvEIK0qSI6IGbEJIm2kG40sZNJeRaEFnKSuZUoQYBTGUzYfeMj7PcBXQtplWFwaUxDygMxSQAQkCyiTMEcyJM94pZwG1F9Mp55QCyMgUPtJ0JiCALLN47U34kgYk4lKklSSCB3yYGsCed799e4TBFSimSCRKIEgnyBOsaT7bGdrpYJUkOFSlLMqMWTqJUSY62a1rBN602VjVI60kuISQOqTkmR3i4jh9q5qWhELTKAkZgCqLnO2L+CrjwrKhTsvP1luAKJM5kqJkGLkC9ZUbgAGIUlaZmFAAX461XW0UgG0G4I/etXRhrxYz+/KozCDlspJNWn0gRKwQoEgZSOGvs4CvEp15jhVRByrBGnfRBVlEnsnjy7/aKmSoGj1OFkKtw9tb7LbKuzawGvrRHZ7g7JAMCQRqLa8o8eFSbKw0BNpTeTyju14TpwrFzdMXRfwzxYQ9aCW5UoHgNADxGnEVNuqUtJDmdIWAFJSElRm9oAiwjiJjxqfFtpLaWh1jITJiYMKUAAYHVCjyME2qxsXZSVIaKVRnCSZPHikHTUk386iMqX5i6PcFiUl05isSMxUApQiZA6wvxMad9Vts7OSnHMrkhl1GVDhTl6wJnkJvING8Zu9lWCkLUm5zAE2SSSch1EFN5GvfRlGxBjcMrDLaWgpymSR1DACYUrS1zaSQZNwB06cXlNDRy/fDC5Vp7JIm44ggRY3tBHjNG9nYNb4bSVtnMkErUrKqct+tPZmwkXJ5CaG7fwTiM7DyCHmjOeP5qfvd4MEzPMG4swfw4WypshaElKSQ8VHhcoKTqDqIm8aUPLoprAQ3w2MlODS6EJbAKQlIMkJ7CutYahHD7PnS/hXlPENg5UkZnCBMADrKKiddI0iTpT5vScKcG6hsthKBmSDmzhatO1NjlHLSuZ7OfN0yTmPDRcHqgga8T51Oq3GViC+LeXj8Q1g8MAGkEpQBYRABUq5A6qRPCBa9da3V2SMJhUokIQkKU4VCCSCoEzFhCZvwIof/AA02Aw0xnAzLdjMuLfkTHCBcnUnwoT/FXewR9BZVM/zVDu+xPv8ATnW64so53tzGOYzFu9GCrplwkcSdEmwsYF/E0+7F2cwyy0jOkKbSc6kxBWqYkKN7gCbC3de9/C7c9IaOJeTdwQ3zCZBK/MiB3A866I1s5lPZaQIMiEixPGp2iaENh8LK2luZAUGAUpz54jqpPYMZr8z4ihj+zMQIZdaWEKPVWCSpF+rcWBNiddfIdC2rsBDy0ODqLSZJAHX0jNoTECKKBsQByoSYkjjG1djusPLbUwQCc4W2TMXzHMBfq6wBBE0ExOyXEBLhV0iJKTE9UQCBNjYmDwuOdd9xi8qFKi4Bifj3Ugnazr6/o7ZTf7K20gL5KAgRA85ERUy0k+QoTGtllTaFLcUpa1FHRE9dKU3Agm0gxfS0VBh8yoaU2VFJISlOs6kERfSnR/ZXQOqdfgBCgG1FP8wzOgNrTx4AcBTDsfBYfEOjFoJDiSQpKV2kwdNY99zWH9IryxinuXsIla0PsqRIzJURyOnLy7qeHNis6hABvcDjET3x8KLpaA0AF5tzOprwprpjpxiqQUIruwU4VPSOYglWYJbNgE8rakjWkTeDZzqU9K5DudSsoBMgEk9UA3nUzoBbjHZdqbIafADiZy6Hl8K59v3gfr4aTCinsgGFgDrcgIEknS1Yy0dq+RACdhbHcWgFkhKBcotmCxrI7RhJ1/FTJsfZGIbKVGMubrhJKZmBI4wBHEcokVvubhCyUNuoVnIJTIjKm5uSbyIvrIIvFOCkVpDTSz2Aqb1JbKQytCSlfMkRBBtAmdCTwAM8JTd9djsMN9IjM2tS4DdwACCFEZiRoO17tK6jiMC2pQWpAKhoTw1+ZoXvLsJOKa6NUAi4JEwY9l4nwrRq0M4W5hznK2xY8NYRpCj8ecRHHdjDLzKdzGQc0QTPGJ1tw1sOFdP3b3NaZV0wWHoKgEi4sbQZ1txtfzofvDtlOHzFCGcwBSEJIso2MCIOqhcSY4Cs2n2Sc7OAxC+uGVEG8wb+dZVt/buIWoqCoBOgQmB4SCY86ys6iAGew2UkSCJN+BHMx4e2qxBUOsBP9B+/GrDuK+rKSoEm0QZHnGnnUyUqQgAgQbgGPamZTVW0g6A+Mbgg8PdRfCEZEnW0EHjz08qqpwkhXEfHhWbOxQSAFDQx6zr7aJZjjofKL+GdCcwAORM2vor3TpRPZ4PRHKcqtQm+a2kD235VRcVEqnLnbUArmoGQO4nnaiuxtl4h1sONBZEGYEwZ1ngLa9x88HFyWCTdOOSlTSiokoKs0kQJQQCDExYak1NsnEpQ22jpCFXzEAHIOKYGpAMULdwii+W24WE9szIzakBSe0BTHs/Z6OjcIZ6QwATGUtk3mAZCU3GkcxRtpUDS7HndlaFlaQ4ohZAVmQCOqCrrOZpMcreWgJ4jENtoWpLqggqJClXzriSbCVAJmCCBI50p7rEMocKUFagqIUACEi5Mk8EybWsReRTjgdjfSMKhTiSl5OYRMCSoTMa6eV67dN/Kho5zvXshTobhR6QkBok2UOsqVKMBKYSTwidLGgG5G0l4Z11IzAuIKSURmSZkEE8iPSaP74trwbiXWrLS6uREpBiE6gaX52vaaVdl4gtvIkhXVMrB0URIMm1iffUTdOy1wH9vtLxKiG0FbrKSXFwOqgG+YaAySQmJjXlQnYZQwc5RJCSEriYVIhV9D32jNIvXRMQlGEY6ig4FgPPOLBzHMAO1MQSCAmIggd9cydf6hbBIza/AeFr3+NZarqSaJHFzfhacP9Hwx6LMVAOcyozlBA6pub+kRNQ/w+3XVjXs7gPQoMrUeP4QeZ49091Qblbt/TFJC5S3m60TKiBOUcCYBvwkc67ts7ANsNpaaQEIToB8eZ76003KStjJm2wAAAAAIAHAcBW9exWRWoHlZW1ZQAJ3lddSwotJKl8AJ9pBsK519NdDpWG0JVClBK0gEDtSqxKgSmBEa8K63URwyJnKmSINhccvCwpNAJG7OM+nJW09mKFSQFG4UDJggWFzF+FM+ydhs4cfVJgxBMmVePCfnRFplKRCUgRyFbxQgIorwpqUitSKYEJTUS2gSDAkaHlOsVaIrQpoArFHGo1Jq0pNRqTQAPxSwhKlnRIk+A8a5Xt/fbEKcHQ/Vtm6QYlQESomNNbDw4115aK4/isKHMW6cgLbf1bd4kychM2iZGg7XHhMhMKbL3qQELbSlpswCFJnLmOUEQeOgEcr0CRsJ3Fyh1xLaioqJ4EDWMohStbd50pia3EDiFOO2dVBHHKTc8eZ7hc2pY2luvi2lBSgShKknq9aSeAGijaCYM5hqZodiKTWxEJSEw2u2pE3NyJBgxp5VlavbdczGGzHDspgcsoFo0rKLQUJjmUEAoEgkk+JmFDwGh0vRfGYVxWX6socPVgDW3WJ8jw5GotrPpWpQQkRlAmQdDxgAG+W44I4yal2Rtbrhx5XWCOjTH2UiMy9e2QMoOnHhWbS5Gz1jCFtl1SxCklChe8EEm3GxnugeYrZ2HyvpSvsrjhMpVcHz/elNewcKlalZkgNkRYXSSFQkweQyzS1jijqZLKb6uvAG0GeBzeyprlDiWNt7KOHKYKghXAjQ9x4gif6027PW8xhUhtag3lld4ChZROsTwveIihG8W2unYbbKwVZs6k8urEmTaSTTU3hQGErRdIbTabAkAKJzJAPWzC1YzbSVPsmVpAXdpK28OFJBugqzJnjMhUC4JEagjL3XOpcZDufKUEdpSdBJPaGpSLieMUL2BgnhhmXm5WkAIIsAkyoQZ10m0g35EUVx2wH28quhUgKKJ6qiBmcCCFKPPWI4iqhCVyVcuyZWOG7m7BUVrcDRaUczeRIAVoUqmyhxBFuIFPSEAWAihm7Oz1MMBCpB17WYX5TceHOaL11x4LXAh/xU2M2cG5iI+sQpCpJMRmANtOI9BQPdvclGJ2etYGR1bi1sngmDCRf7Jggz3cqeP4gYfPs/Eg8EZv8JCvhQjcreFhGzsPnXBCSCkAk2UReNJsb86Trso5O9tVxKHcO+VJWhQAQTA6uaQAeIURA4AGqQwwEKA6pV8OMeNMH8XFsPLRimgtKicqpjrZR2hB8B6Us4N8qaTB66VpITxXoOfAxw08K5ppWmh0fQW6mwzh2kNqiUoSJE3UTnVbSxgTxphApLbx2MXMuBOmnHnoBFSdE+e08v/q+Kq38iQ/G+xxNaKdSNVAeYpYZ2SswSpR8cvviavN7IPFR/wASvhQpt9BtS7C5xKPvDyv7qjOOb+9+/OqqNkI438b++hm3GkhzDoAH80KOnCY9KJTcVbHCCk6Qd+mo7z4CfdWfSuSSf33xUjaBAPdUkVeSMFfp1cEep+U1XxGNWlbacqeuTeTaBPITVjEbQZb7braPzLSPeaAYjb+GcxDQQ+hWXMTBmBGsi1KTo0hHc+Pf7DDkWdVAeAqBfSIMjrjkdfKrLOJQrsrSrwIPuqUimZlZjEpXprxB1FSkUNxzALzYEg5VXB49WPT41KH1t2WMyfvDh4ilY3Hgixu1mW1htaoUe7SdJ5VTd2+0Heiubxm4fuaR9oPO9OrOFZ1qi/EcMpjTT0qLolIcSo87q146geMjxrKU5JmW46XjVFKFFKSsgWSPtHgKTN39kS4ouIUk5iSmIFrp8IMxRRzej61KQBknKe/v7qYzcSLitIyUuOiuSotNLe2WHXngyMyW461xcTEiL8TYm+U2HFqWmoVpqxicdhYlPVZdQhsWSmNB/hOuuvGspsisoA+ZMCohYCgZCTImMyYIJHPq5jI1IrMAwo5mx1jJKouSiJkDlF7c6t4dhxwB1c5UnKlQiVZgR3Ejj3VVaTCkZSUr6MAmO0gp5HURaaxirdCbqLbHbdbZjbifrHciVAOSi+ucZbeZ46acKEP7uqxruKOGFsODkSQczgBgjQdaAo3HCPAtu3tF1lZUhtklYAUFIJBiOsRPaIF/Oo9j73nZfTNJbDi3F5s6jbjaB3lR860cFEjT1IydIUGMMFslwDrNkBRn7Kj1eNoVb9XdXVtmbWU3gUv5R9FQppbthJUFAmLXMpykae+uUp2hnxLigAhL6jmSNAVk6A8iZ8hV9GPdLYaDqVNIKj0QWR1oMykxMcxI76zTpm0o3k6Fu5h/o+FaK4StTgWUKNgFTCdeAPD/AHZNu764b6OlsuZnM7RIBB7LqCeMmw5VxJzailza8zeVXkffJHHSpVvPwJkIkdkCJ1HZEC8UbmhUsnaG/wCJHSrCGGozAlK3M0GPIX+RrH9uYperuUfgSB7T1qQd0mJWzmJUSqSVTrlI0OmgtXQOirl1NSd0mbqEUkxR35ceThy4HFKGi88qOVRAsTpc+3uv5sd4N4NnLqpRT5kmSSAdBJ8hpNXd/QDhHEzqBHf1kn4GhmzMY2nZyVOEAAdaO0qCcoF4zRzBoScoZ9ibp4Au/rvWaaTwSSsfiMAedj36VV2NhvrYkHompkazHZPOCSR5d1Cc68Q+pdgTccgeHj8aY9h4MM4d1wkEFSUhXDskm/G5HpWiSVIm8nW+jSZUtQSlIkk6Dzm2lUDt/CJVmOKT+kKP+Wag222HW+hUVArhSgDEJvlB99Q7K3DYdBOWIiCSoyeRGYcKh6yc9iWTrdLMmEsV/EHCI7K3F/lT/rIoY9/FJA7LSj+Ygf5QaLf3LabQo9GwqEk9hU2Heo3pdS0kCyUjwSB7hS1NaWnyTHxS4R4f4pYgzkYQZPHMqO4RFCcXvbtB1YWEFKgbFLXL8wPOi5NQ5YOnCsZfEt9FLbHhA9e3dqr1ccH60p90VUdwmNc7bk/mWT86Nk16k1L+ImxqdcANvd5w9p9A/KFH3gd1Ftgbv9E6HemKimZGWAcwKfveNWAqiGykk5/L41lLX1emJzbJktQqSoxy/qefE+6rezscpskFZy8I+QiPCoHm4qvlq4/F6/ZFIYEbTuFZ7iYmTrrqPjV9vbJNuof340qPNkJJ5Ca0abXqrXkNB86pfH6i5iS4pjVikIdHYE693edBBjiKXMZu6QQGlnKJso6aReDNs3ColrWNK1TtB4fbNax+NjL+6IvFEqHY6kC8jnF+XEAd/HlV0bTWlOTpzYJywo2E6RrMenGrWDxb67CCdbwPcKrbS2s42IXh1HhKIny61q3jrReUPw+iBzEukf8AmFz+dYA4feve9aJw7qrl52OQCyddDytbjVD+2scoXU76x8agex2LNlLeg27c+6td8X2PwS+h0HZKD0DWac3RpmdZyiZm81lKrGPWlISXlEgATm1jzr2n54/X7MX9LL2cMxGNxDgPSOFUmCJGgHdbkPKrRXldzRCSnMJ74HkAZtVRC+mcISnKFL0HI+Hd8aKMYYLQFgKIaK0qnQphS0cLGUkedNyp2zl2botew3s3GCP9/wDVS/vdiApZUJsoJv4Tb1jyqbAN5sMVyQoLgGfHh5GoN7GAnoxeMoubyesT7aqU4uVdmWjozg228UCcMlSgSlJUBxjQ+U0XwmUMOda6wcycslOW+YHlzE8O6hSMY2EkBABygacQQSfOD60Y2YzlxCU6pUBrxBF9PEis5+zeDvBXwyElGaXCCIByRxGnW51bDaQgHrAE2kADvPpPHhRXD7Ww+EzYchwKZdXNpGXOrLHWvYoPDjVrG714TEN9F9Z2kqPVHZSRnuCb5c3nUuUrwsCaS5Cu5eXMxlOZPA87L7zT8dTXMGNpoYCF4NKi2AMmcTwIM3B1n2VmD/iC+G3VulhSxl6NtEibgLBkmITesnBybaNnJJIe9vYRLramyYCkqTPKRr5Vx95xxwNtJhRnKnLoSTEjhe1+4V0HC7zsvYfpFuICujzFAI7RBOWCJVwFKO6TY+kBaiEhAJBJGoBy621i1XGDjyRuTF5ThCso6sSDB15+VPWygBs1EET05JHKRb2AUipYI7z86b9mNqDBJgJztpA8Mxn/AKj6020NIfsG6VuOLOpj4wKe8A2EICe6/jxpF2CD11xoUx43p5ZMAT51xp7ZWdGsrkS45f1bn5Fe41z9KbU9Y5z6pz8ivcaRUKpze5mUcGBsVqpsVIlVeE3qdo7IHEV4EVIuvKTiG40CaL7Abkufp/7qF0a3bF3f0/8AdSUcicsHm2RCbSIuYpXax/SdH0TrgLpUEApTcp11SY8zTttFnqGknYDQzYGwH1juipjwtcd9VHQbbdmfkoasDhHspDxQoRwF/OIFXfowvblV7Jas6O5PhVrRQt4D2sQ2kGwvcnQCKFYTGKWshDYdAiSgxlOomdLEGjW9LZ+jOkRIQqJ5wap7pNR0+naR/wDkinHQd3eB+UB7dw7gdjPlBghOUHLbSZ1sdKFreWmxec8kj50w72HK6TyTP/So0qoeK0IWYkiTBkVjLX1IN1wj0FmK/BFRW8Sf+Y+f0p/1VucUFJC87hClZdBr60sMi96PoTDTY/8AdreWvNVknamWcXhkNrKFOqkRNjxE86yrG3WR06/0/wCUVlRHW1Wk7M3SYH2c/kcL3QKZLaeQBJ+zp3+yaI4JCBs3EO9GAVBIIiJBcWFKJ70meelNmA2WLZcWSOQcQof5xRhOx0FC0uuZkFAJUpKYGVU8CZ9a33Js5lg55u5s1hTXYSW4SoCT2itQ1mSdasb97ssKUxZSAWRZJ0IKtZngRTVgtkYRGIACx0aUAoIPVzgqJm5MQqrO8O6Dz5KkOoIJkAgiBwAKTbxka0Z3Bao4ztrdRpllTqVrJHAxyJ4DurYKyqw7nIAe0fOnXa+4mNgpOZSOXbHsk0Hw+yXmFtpXAlxOXqlJEJX962nuq7k45EmkyDeXdBxx5bqFIAehISqRBCQqTAPBB9RS3i93HsIT0hQZQqMpJ1SeYHI11DejFlLiCMywJvCe0ElJkJie2ePCk/enF9PB7MJyyRGoULiTA63sqdOc1SfAaiTbaM3azHDtoQkrUU2AgaFR49wpXXuvjUG+Hd46CeH4Zpo3KxKGnGkl1HVkHrAfe5x94CukpcCrgg+BmnPXlCVLgexNI4VhcA42olxtaDonMkjxInWLetE8FhFPuIw6bZpWongEzE+Jt50+b7bKceDRRl6ueZMa5e7uNXdkYEssNtKiQCokcZJj40eXcrBRrAqObqPjTIrwV394FUtnKUl99pR7BbSRM3BM+czXTUInKQASLkd1cp2W+FYnFL+8+D6uLNOCw2DllI6/u46hCVLeWEoChEnU3+YokvfHBgx06fQ8PKkXaWMwmIQChXWRrmIHWMmLnraaCeFD0v4ZBMZSCiQkEE5gOtKiNbaCJkGa895OrVUt14OnObxYZbLhS+32VC6ovl0g3pU/tBoR9Ym/ePnSJjXmkgnK3JMDIDMlN7GBry04WoWhSOKj39q55W14VpDTfs55NnUk41B0Wn1FepeBNiDXNIbMhKvarW97+A9R5btJAMdIqdOqbE+POOMePfrtaM3KR0hblq2DlIGJ2evICl5a1Hjaw5JA119lV2s7cHp1JVoYN9e/Q6fsVLvqiXJnSJo5uwky5bXLHf2q5Zg9quNuZOlWTmzFWayhrB8DwGpN6Y9394FpzqKlrv1QrmZ+1FrgcDrxrn1Z6scximG6zouJgjKSB40Pw2wm0dEU36IlSb/e7RsADrS7tvbGfCJLii2vMQCDOcfnTpImguz8Q4SCp9xJuUpUScw5QCAerBII4VnP4nXaUoJL6NN/t0SkjqRXwNu/21ovEDmNeenjGnnXMhi/rASteoyqGY5jI+yYjTmImb8IG94lh5XXMzBzEDiSVAQYEcIOtzpWb1vjM04/b/Y6idI2hjWVNqCiFpjrJSQoxppyqo3tLCtplKoCyJganQeweg7qRMdiEZiBzCQTISSQJIVYknrGOMjvNDsPisyVAKQFJkpzZeGp1vw5m1qcX8TqK/I/sl/DGq9DxtTEsYpanG305h9kgjgbTz19KVH3BIqbZezXFthTYJKrmEEgdxImD5j2mq2O3bxJ1Jj8KFH3VeloTt7pX9v4O3Tm9uWJbLtMeEXLbPe78a0/u9igf5Th/wDrPzqdrZuISUEtOwlQVGQ6iu6Wm3VFLUR1BOHSRcD0rKWxvS7/AMhz/Ar/AE1lY+GZG+Iq4DHoScrgOXnqfYU0aaew6xAMg2OY5QfRRpIQ73gec/CrmHxMdlRB/D/tXouJxJjthkttqBjq8ClX+sVZRtFuTdQ80/AUl/TlSM5Kvzz75qZGME2ASf3xqGmVaHdnbWXRaxHAFXzoRvRtxDqW09KtSg5JSqTH1bg1PiLUFTtAg9ZsK7laH0g+hFWX8elUfUNojTU+0msm3fBWPYWwOIw+QJdPCbE6njCQT7KH7cYwpSjo1KJLrdr6FYm2UGapDGRIhHiRJ8swMVQxYUvIPxp8r66aUKbJdBrGbGYjrAx+If6qonYGFEkOFJ/Bb3VdYwKAOv1idClRj0i9XWMNGiB5AA+utLyDSK2x8MkZkpedcto4SYvwuaYnMOXMhQlRIaEwCdJ1/rVdT+VuCgAz2ufw9lE8E4C0g9Q6hWYJ1tzBMeFPdcLKX9wHwOOSlV1X5aeP79tLO1d3UNOuOsKIbcVmkSY1MGJi6tbcKfn8Mk3AYnwg/wCWqjjCD2ut+FCZHnYVC1HVFOK5Obv4BZOmYeM/5hrVZ3Z06NqnTqzp+lVdQewrSRmSgju/2VapGmAUZoA8VEEehvTWoKmcixGAI1CwfxE/EEmqowKh7tI98V1z6C8syFJjxSfTMTUQ3cCj10kjiSL+yBVeRIW1s5OvDvJPZN7wIM+lRthxJmONdYf3PZJgAnuSR/WvXNx2EielU33Zc3uPvFLzQDZI5S26vgCD+G8elhUrQJuZkSdeMzx1/Zrozu5WGIn6SDHMR7DNVRuczol9QHdEe8e6jdB8C2PsRcI71iVRYXvPrrwt3U27vPKIytyBmQokAkSARYgRExJixGiqbtn7Dw7QH/hg9wkrWonvynqjyouztBDRyrwxZTw1PvVI9KznpqXAbBH22nHulTSWXQnhAGU+KuzeSJkacK92fupjFIUnKtqR1ZWiJn7SUSYIjjrwrpbW08LFytPiDHtFEMM+0odR23gf9qPEqr/v1HtRzpG4+KUEB3FRk0yImPMxPmKuN/w4Y1cU8tVpObLOUQLJFPisQBbpUHuzCfaap4nEPK7CVH8pR8jVR00uEPAGZ3PwyST0MqVJUVFSiZ1nMTrRDD7IZRZLSEeCAPcKhxWMxKdM455kD3gChiduPJMLv4j5GtFD0FpDA4hCRJIA/fOqeKxTadVJ8zz0oU9jEupV9eltRt2/+3NXONq7ZLauhVmKsxhQGUK74zX9YtWGs9RYgiZTo6HtDeRpswOsBqRw146a+w0v4jeognJ2TFlnTwVMmkT+3nA4c0LGgHFKuVvPWrScW+kFUEgaxkgHWCZv3CJPKuWWnq3bf6mT1Gxj/vW+LdW34U/0rKBo2w0oZihsE6yhU+xB8daylWp6f6hufsEN4laie0kckpAn0AqVLa+CFnvIM1ROKc4lX78q9S6eftr3KAvh1QEE+sV6hwmqSXADcT50Qwrk6pEc4+MUgLeGW4bBXkdKuLzAXSJ/CYqBDqToEetSIfA6pSjx/rUvIyZp1ESc4PIj4zW4WgiyZPOfhXuHS3xUnwsffRZr6GEdtxJOoATHpHurNpeikithdmukBQOUcx/UxUjpWJzYlQA4DKPYKnwQaMgJzjnIEfpV86x9tsAwlYPeB86naryVWCr9LSU5FLWoTMkgX/SgmiOH2gMmVKUxr2iTPOZBoU4+Qf6VYwji+0FJHOYHvp7VQrCzWKdjWPL5mtVuK0UVgcYCflPtrUgKjM40fU+4URbwbSkkoWFKi+WPiBUVErLB4DY0U6e6B75+FbBABCghQPMqj3it17NVpAPmkefVJ9tajZyUm77STyzC3qaKiFMLth4JkpMdyvkkTUYw7qkyLctT7DVRKEjtYlgRzUCPQVDjtrhJBQtpavwpPvMUti6KT9hRS38kFGZPGBB900NS2kKKi2pP5Vf65rcb1vKTCUAxxCT86i/tNx2EqWhJ/EkijbQ7suNLC+rmyf8AyZPeIr3+zwn/AIhs9yflFUTsp6etkCfvGAD6RWq8MtJ6gbdHNEkelKl7DPoJYPKFWfCTxP8AtRdltjVx1Kz3hU0soxboPWQ0PzoF/ZNQuY5ajokdyQBUuN9lJjJj32U/y1A92W/rFD/ppvc94qiFqiYtzqticSRY1NFBYvtnjHiahfcQDZRPs9xNCg8U9a4rTE7RUoQVWHh7oprd0JqIZRi2wDJV5H51hxrf/NUD3pn2j5UvHGq5+on31v8AS7jKtM8Qkx7yKrdJE7YhoYtJ/wDUbv8AeSfkPfSVv1g0HK+EpcUDEICwIgyMugPGZtE8KL4vaeQSVEcwqDHhc0o7b3kEwgA5rWiZ9LU1LUvGTKe0VXsQVLzEKM6RN9LHSbTfW9bYXaKmhKAEqzdq5I8LzVfpzmlSSQb6R5++pHFBQkQkcjJrrcVVNYMCyvbD09pR8MwHpNZVEZBbqnvlV/bWUtkPQ6Dn0gxAJjvPwrUK8/Ca9AQDp8anTi7QNO4CrGQg8gB76tYPEKSbKtyj51EHBzUPOsQhR50AFw8qOsD7BUTb97zHI1thNkuKE6eJiimG3XdP2Z/VFQ5RXZW1siwDWf7baPzgifYaJO4noh1H2yeQSCPVQrFYTF4YSkQnlJgeZiqT77rgJcIHcBr5gGpu/wAB1RhxxV2gk94Ee4RXgxn3QJ/KPlPtqbZ2DCzC8yRzgn2RRnB7DbzQrOkcytIkdySn40OSQKLYATtVYjMJHdNEWMYhXGfG9E8dsFB/loJjjMz5UJZ2IVGAmDyvPoLUt0WPa0WFOC+UkTrBifbVZxR5D3+2aOYTdDEEDrJ/UI9xJqwrcxQHWVf8Jn3xS3xXZW1i21jyk2HtN/Q1ZGPatmZSTxlSxPkDVzHbtrTdAMd9QYbZb05Up9dPWKLiwqSK2Ix4VZLSEjhdRPqTUScTBmAe4iiOO2A8gSoN/pN/SBQdTUa8KcaYnaCY2woJKUwkHUAfGq4ekyY86rJdItYjwFWGcNmEjKPEge80UkK2ydGKV99XqfhRfBbLQtOYvpQeOaaBskoNjHgflVr+1TIKgT4mffWck+i4tdhsbPZTq90h7gQPM391U3cSSShKATzTc+wVIzvG0kfyAfT5VQx+1G3Loa6NXMKOnhastsuzW49GKxaEmFDIfEz6EVbwe227JK3FcIX2fUGhDzhUIUQeVVnJ8aHC+RqdcDHtTaiAIDTMn7QKifHl60ORgAsBXStX4BQnwyki9AHfzEd1bFyRr/WmoUsMTkGXNlJn+cj3/GhW1dlqQJ1HONaql2DJTPcbe41tjtpZhAbQgfln2kE+2nUk+RXEAYtPfQXFMAmTemJ5jMJsPGwFQq2A6pJUnIf1j51qppcszcWxYdMTpPcdPLjUCVkXFjRPEYQpMKgHy+FU3EKFdCkjLaTt4sgAW/wp+Kayqt68pbYhQWLxmt04hWkgDwqKxvpW6RyNUSTpWTVvCY8oMiPSqqMObStPrPuophNnA6n4e+pdDQe2TiVukEqenkgQPZTdhHVouvMAOZBPqTSlg0obTZ1f6J+FU8S4Fn7ZH41R7K55R3M1To6Qjabah2gQdZ+VUnsfhUKkMhR5hFIbW0A1dKkTykqqwnbjrmpAHcAKlaVD3jod6WjYNCeEx8BNWGdqYlXZbQB3j50jIdQhWYkr8/61cO8bR6vQz+o+6m9P0gUvY2PbYfTY9F4Aj51Ey4Cc6klJ55h8KC4LabA/4f2zUL+Mw7qo6IjuTS2jsZBt4pVCSI8yfdW+M6Z4WcCRyKo9lVNmstJTZhzxNZiVsoOZKCSO41OLwUWNn4XENaqBTyF/eaLsbYTMZT/h+VK/94sQTlS2mPD20W2cT2lrMnhaKJJrkEw+MShdreB19tD9p7uoe18jVXaGFadsoL8RI91WMBgA0Oq4qB94k++ouiii5uc0BYmedLG19kFrRU047Q20gDKor8Ugn3UkbVxDaldRSj5n41rpuTZnJRoodGTxA86i6Qg86nUmRwqstZ0EVuZEiX+69YXzUIYdP2D5X91ZnULZT5/1pDJk4hMQrNPMH4EfGsee+4VqHeNPSbVRee5pivMPj1JPUMHlak4jTPXMWLBRvwrQvjSZ/fLjXuKxTrllmRwtVDE4VQBy+R1g+dTsLUgg40qOMcTF48DWjuXRJUo/lEe+Qaiwm1SlAQ6TImxvPgTpUIDSjmz5ZPE/CoynkrFYNncOQCTYGrOyWMOsw6opPOJHvqligRcLChPPSqa2VzGU+Z+NOty5C6GnHbLZSPqlBzuHyml/FYIGT0UTyB+cCocM5P2ygzEGpDinE6KkfvhUxhKPY3JPopuYVudT6VlSq2ge70rK0+YzwVGSKtSLAAT4VlZXQzALbO2Jn6ylR4VM682yYQiSPvXrKysk7eS+ESJ3kdSIyo8xb0qo9tB5y5yx4CsrKral0K2yPDYNSzEC/GaLNbsLIkEGsrKznNrguMUwizhQ2mHE+MGoG2MKpVkLnxrKyksqxvA17MwjQTATrzqJ7ZLaT0kkRy/pWVlYW7NawDsTvYUHIkSO+qz297mkJE91e1ldK04mLkyknaDz6u1B7rUcweIcZGZRzDyrKypnV0VHizzEb7TYCo0b7r0IHpXlZV+KPojySB20NuKcvAHhQZTknmaysqopLgmTbJ8NiijkRyVevMTtAKuUBMcU1lZTpWK8E+D2lAs4oeAqltXHLP2irxr2spbVZV4BhxE61K0ylRuojlAryspsSCH9jkpkOT4ihuJaWgnrT4T8aysqIyb5LkkVGllR0/fnUjuDTbVMawB86ysqmJGpwtrKnxFV0rUmRb4Hx/24V7WVP0KIn1SQCkSTYzw+deBXfWVlPoTPSqb29K8rKygZ/9k="; // Modern Hall/Auditorium
    }
    if (name.includes("Bethesda")) {
      return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEndFIMc-m3w34HR7hSOsTxidUgUX0wCZpuA&s"; // Scenic Foothills/Mountains
    }
    if (name.includes("Gallery")) {
      return "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSgoNA7nuXqkgaQh0kyHUrV3mivVYBbi_JN_Q&s";
    }
    if (name.includes("Gardens")) {
      return "https://karunya.edu/img/campuslife/oprah.jpg.pagespeed.ce.4zTbOy_BCZ.jpg";
    }
  };

  const fetchRecommendations = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: currentStudentGPS.lat,
          lng: currentStudentGPS.lng,
          activity: activity
        })
      });
      const payload = await response.json();
      if (payload.status === 'success') {
        setSpots(payload.data);
      }
    } catch (err) {
      console.error("Error communicating with campus GIS pipeline:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.body}>
      <div style={styles.dashboardCard}>
        <h1 style={styles.title}>ECHO: AI Recommendation Engine</h1>
        <div style={styles.subtitle}>🔴 Real-Time Live Campus Data Active</div>

        <div style={styles.controlGroup}>
          <label style={styles.label} htmlFor="activitySelect">
            What is your objective on campus right now?
          </label>
          <select
            id="activitySelect"
            value={activity}
            onChange={(e) => setActivity(e.target.value)}
            style={styles.select}
          >
            <option value="study" style={styles.option}>Quiet Studying & Exam Prep (e.g., Central Library, Study Halls)</option>
            <option value="social" style={styles.option}>Socializing & Group Gatherings (e.g., Gallery Halls, Emmanuel Auditorium)</option>
            <option value="photography" style={styles.option}>Scenic Landscapes & Photography (e.g., Bethesda Scenic Overlook, Outer Gardens)</option>
          </select>
        </div>

        <button style={styles.btnQuery} onClick={fetchRecommendations} disabled={loading}>
          {loading ? 'Processing GIS Nodes...' : 'Process Verified GIS Nodes'}
        </button>

        {hasSearched && (
          <div style={styles.resultsBox}>
            <h2 style={styles.resultsTitle}>Optimal Live Locations</h2>
            {loading ? (
              <p style={{ color: '#4a5568', fontStyle: 'italic' }}>Running machine learning predictive sorting matrix...</p>
            ) : spots.length === 0 ? (
              <p style={{ color: '#4a5568' }}>No optimized campus spots found for this category.</p>
            ) : (
              <div style={styles.gridContainer}>
                {spots.map((spot, index) => (
                  <div key={spot.id || index} style={styles.karunyaSpotCard}>
                    <img 
                      src={getImageForSpot(spot.name)} 
                      alt={spot.name} 
                      style={styles.cardImage} 
                    />
                    <div style={styles.cardContent}>
                      <div style={styles.cardHeader}>
                        <h3 style={styles.spotName}>{spot.name}</h3>
                        <span style={styles.scoreBadge}>Match: {spot.final_score}</span>
                      </div>
                      <p style={styles.spotText}>
                        Current Live Traffic: <strong style={{ color: spot.crowd_level === 'low' ? '#10b981' : '#f59e0b' }}>{spot.crowd_level.toUpperCase()}</strong>
                      </p>
                      <p style={styles.spotText}>Student System Feedback: ⭐ {spot.rating} / 5.0</p>
                      <p style={styles.coordinates}>
                        Active Node Delta: [{spot.lat}, {spot.lng}]
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Scoped UI layout design styling adjustments 
const styles = {
  body: {
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    backgroundColor: '#f0f4f8',
    minHeight: '100vh',
    width: '100vw',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    padding: '40px 20px',
    boxSizing: 'border-box'
  },
  dashboardCard: {
    width: '100%',
    maxWidth: '900px',
    backgroundColor: '#ffffff',
    padding: '40px',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    borderTop: '8px solid #0b3c5d',
    boxSizing: 'border-box'
  },
  title: {
    color: '#0b3c5d',
    marginBottom: '6px',
    fontSize: '32px',
    marginTop: 0,
    fontWeight: '700'
  },
  subtitle: {
    color: '#dc2626',
    marginBottom: '30px',
    fontWeight: '600',
    fontSize: '13px',
    textTransform: 'uppercase',
    letterSpacing: '1px'
  },
  controlGroup: {
    marginBottom: '26px'
  },
  label: {
    display: 'block',
    marginBottom: '10px',
    fontWeight: '600',
    color: '#1e293b',
    fontSize: '16px'
  },
  select: {
    width: '100%',
    padding: '14px',
    border: '2px solid #cbd5e1',
    borderRadius: '10px',
    fontSize: '15px',
    color: '#1e293b', // Force high-contrast dark text inside the dropdown container
    backgroundColor: '#ffffff',
    cursor: 'pointer',
    fontWeight: '500',
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
  },
  option: {
    color: '#1e293b', // Fixes invisible OS-level browser item text visibility
    backgroundColor: '#ffffff'
  },
  btnQuery: {
    backgroundColor: '#0b3c5d',
    color: '#ffffff',
    border: 'none',
    padding: '16px 32px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: '600',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 6px -1px rgba(11, 60, 93, 0.2)'
  },
  resultsBox: {
    marginTop: '40px',
    borderTop: '2px dashed #e2e8f0',
    paddingTop: '30px'
  },
  resultsTitle: {
    color: '#0b3c5d',
    fontSize: '22px',
    marginBottom: '20px',
    marginTop: 0,
    fontWeight: '700'
  },
  gridContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  karunyaSpotCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: '12px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'row',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s ease',
    '@media (maxWidth: 600px)': {
      flexDirection: 'column'
    }
  },
  cardImage: {
    width: '220px',
    height: '160px',
    objectFit: 'cover'
  },
  cardContent: {
    padding: '20px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '6px'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '10px'
  },
  spotName: {
    margin: 0,
    color: '#0b3c5d',
    fontSize: '19px',
    fontWeight: '600'
  },
  spotText: {
    margin: 0,
    color: '#475569',
    fontSize: '14px'
  },
  coordinates: {
    margin: 0,
    color: '#94a3b8',
    fontSize: '12px',
    fontFamily: 'monospace'
  },
  scoreBadge: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    padding: '6px 14px',
    borderRadius: '30px',
    fontSize: '13px',
    fontWeight: '700',
    border: '1px solid #fde68a',
    whiteSpace: 'nowrap'
  }
};