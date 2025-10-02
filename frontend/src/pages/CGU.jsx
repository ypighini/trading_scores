import React from "react";

const CGU = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-[#f1f5f9] font-inter p-8">
      <h1 className="text-3xl md:text-4xl font-bold text-[#38bdf8] mb-6">
        Conditions Générales d’Utilisation et de Vente (CGU/CGV)
      </h1>

      <section className="space-y-4 text-gray-300">
        <p><strong>1. Informations légales</strong><br/>
          Le site <strong>ScanPicking</strong> est édité par [Ton Nom / Ta Société], basé en [Pays de l’UE, ex : France].  
          Hébergement : [Nom de ton hébergeur + adresse].
        </p>

        <p><strong>2. Objet du site</strong><br/>
          ScanPicking propose un service d’<strong>analyse technique et fondamentale automatisée</strong> sur les marchés financiers (cryptomonnaies, actions, métaux, forex).  
          Les informations publiées sont fournies <strong>à titre informatif uniquement</strong>.  
          Elles ne constituent <strong>ni un conseil en investissement</strong>, ni une recommandation personnalisée.
        </p>

        <p><strong>3. Accès aux services</strong><br/>
          L’accès au site est libre pour la partie publique.  
          L’accès aux analyses complètes est soumis à un <strong>abonnement payant</strong> (différentes formules selon les marchés : cryptos, actions, métaux, forex).  
        </p>

        <p><strong>4. Tarification et paiement</strong><br/>
          Les tarifs des abonnements sont indiqués en euros et toutes taxes comprises (TTC).  
          Le paiement est effectué par carte bancaire via un prestataire sécurisé.  
          Les abonnements sont reconduits automatiquement sauf résiliation par l’utilisateur.
        </p>

        <p><strong>5. Résiliation</strong><br/>
          L’utilisateur peut résilier son abonnement à tout moment depuis son espace client.  
          Aucun remboursement prorata temporis n’est effectué après le début de la période payée.
        </p>

        <p><strong>6. Limitation de responsabilité</strong><br/>
          ScanPicking ne garantit pas l’exactitude ou la fiabilité des données fournies.  
          L’utilisateur reste <strong>seul responsable</strong> de ses décisions d’investissement.  
          L’éditeur décline toute responsabilité en cas de pertes financières liées à l’utilisation du site.
        </p>

        <p><strong>7. Liens affiliés</strong><br/>
          Certains liens vers des plateformes de trading (exchanges) peuvent être <strong>affiliés</strong> et générer une commission pour ScanPicking.  
          Cela n’influence pas l’indépendance des analyses publiées.
        </p>

        <p><strong>8. Utilisation internationale</strong><br/>
          Le site est conçu conformément au droit de l’Union Européenne.  
          Les utilisateurs situés hors de l’UE doivent vérifier la légalité de l’utilisation de nos services dans leur juridiction.  
          En accédant au site, l’utilisateur reconnaît que la loi applicable est le droit français (ou UE).
        </p>

        <p><strong>9. Protection des données</strong><br/>
          ScanPicking s’engage à respecter la réglementation RGPD.  
          Voir notre <a href="/politique-confidentialite" className="text-blue-400 hover:underline">Politique de confidentialité</a>.
        </p>

        <p><strong>10. Contact</strong><br/>
          Pour toute question : [ton email de contact].
        </p>
      </section>
    </div>
  );
};

export default CGU;
